<script>
	import { onMount } from 'svelte';

	let showModal = false;
	let modalImage = '';
	let modalCaption = '';
	let cardVisible = false;
	let badgesVisible = [];
	let projectsVisible = [];
	let visitorsCount = null;
	let visitorsLoading = true;

	// Projects carousel
	let currentProjectIndex = 0;
	let isMobile = false;
	let isAnimating = false;

	// Comments
	let comments = [];
	let commentsPage = 1;
	let commentsHasMore = true;
	let commentsLoading = false;
	let commentName = '';
	let commentText = '';
	let commentSubmitting = false;
	let commentError = '';
	let commentSuccess = false;
	let showCommentForm = false;

	const techStack = [
		'JavaScript', 'TypeScript', 'SvelteKit', 'Express.js',
		'Kotlin', 'Python', 'Java', 'FastAPI',
		'MySQL', 'Fabric', 'Paper (MC)', 'Dart', 'Flutter'
	];

	const projects = [
		{
			image: '/img/project1.png',
			title: 'Winerecia',
			description: 'Сайт майнкрафт сервера и панель управления'
		},
		{
			image: '/img/project2.jpg',
			title: 'Quikk',
			description: 'VPN сервис по подписке'
		},
		{
			image: '/img/myglyph.jpg',
			title: 'MyGlyph',
			description: 'Приложение для управления глифами Nothing Phone 1'
		}
	];

	onMount(async () => {
		// Check if mobile
		checkMobile();
		window.addEventListener('resize', checkMobile);

		// Fade in card
		setTimeout(() => {
			cardVisible = true;
		}, 100);

		// Animate badges
		techStack.forEach((_, index) => {
			setTimeout(() => {
				badgesVisible[index] = true;
			}, 400 + index * 30);
		});

		// Animate projects
		projects.forEach((_, index) => {
			setTimeout(() => {
				projectsVisible[index] = true;
			}, 600 + index * 150);
		});

		// Load and increment visitors count
		await loadVisitors();
		
		// Load initial comments
		await loadComments();

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	function checkMobile() {
		isMobile = window.innerWidth <= 640;
	}

	function nextProject() {
		if (isAnimating) return;
		isAnimating = true;
		const itemsPerPage = isMobile ? 1 : 2;
		const maxIndex = Math.max(0, projects.length - itemsPerPage);
		currentProjectIndex = Math.min(currentProjectIndex + itemsPerPage, maxIndex);
		setTimeout(() => isAnimating = false, 400);
	}

	function prevProject() {
		if (isAnimating) return;
		isAnimating = true;
		const itemsPerPage = isMobile ? 1 : 2;
		currentProjectIndex = Math.max(0, currentProjectIndex - itemsPerPage);
		setTimeout(() => isAnimating = false, 400);
	}

	$: visibleProjects = projects.slice(currentProjectIndex, currentProjectIndex + (isMobile ? 1 : 2));
	$: canGoPrev = currentProjectIndex > 0;
	$: canGoNext = currentProjectIndex + (isMobile ? 1 : 2) < projects.length;

	async function loadVisitors() {
		try {
			// Регистрируем посещение
			const response = await fetch('/api/visitors', {
				method: 'POST'
			});
			const data = await response.json();
			visitorsCount = data.count;
		} catch (error) {
			console.error('Failed to load visitors count:', error);
			visitorsCount = 0;
		} finally {
			visitorsLoading = false;
		}
	}

	function openModal(project) {
		modalImage = project.image;
		modalCaption = `${project.title} - ${project.description}`;
		showModal = true;
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		showModal = false;
		document.body.style.overflow = 'auto';
	}

	function handleKeydown(e) {
		if (e.key === 'Escape' && showModal) {
			closeModal();
		}
	}

	// Comments functions
	async function loadComments() {
		if (commentsLoading || !commentsHasMore) return;
		
		commentsLoading = true;
		try {
			const response = await fetch(`/api/comments?page=${commentsPage}&limit=5`);
			const data = await response.json();
			
			comments = [...comments, ...data.comments];
			commentsHasMore = data.hasMore;
			commentsPage += 1;
		} catch (error) {
			console.error('Failed to load comments:', error);
		} finally {
			commentsLoading = false;
		}
	}

	async function submitComment() {
		if (!commentName.trim() || !commentText.trim()) {
			commentError = 'Заполните все поля';
			return;
		}
		
		commentSubmitting = true;
		commentError = '';
		
		try {
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: commentName,
					text: commentText
				})
			});
			
			const data = await response.json();
			
			if (response.ok) {
				// Добавляем новый комментарий в начало списка
				comments = [data.comment, ...comments];
				commentName = '';
				commentText = '';
				commentSuccess = true;
				setTimeout(() => commentSuccess = false, 3000);
			} else {
				commentError = data.error || 'Ошибка при отправке комментария';
			}
		} catch (error) {
			commentError = 'Ошибка при отправке комментария';
			console.error('Failed to submit comment:', error);
		} finally {
			commentSubmitting = false;
		}
	}

	function formatDate(timestamp) {
		const date = new Date(timestamp);
		const now = new Date();
		const diff = now - date;
		
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);
		
		if (minutes < 1) return 'только что';
		if (minutes < 60) return `${minutes} мин. назад`;
		if (hours < 24) return `${hours} ч. назад`;
		if (days < 7) return `${days} дн. назад`;
		
		return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>f14my - Full-Stack Developer</title>
	<link rel="icon" href="/img/icon.jpg" type="image/jpeg">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
	<link href="https://fonts.googleapis.com/css2?family=Elms+Sans:ital,wght@0,100..900;1,100..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet">
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="page-wrapper">
	<div class="container">
		<div class="card" class:visible={cardVisible}>
		<div class="header">
			<img src="/img/icon.jpg" alt="f14my" class="avatar">
			<div>
				<h1>flamy (f14my)</h1>
				<p class="age">17 лет</p>
			</div>
		</div>

		<p class="description">
			Разрабатываю на заказ сайты, приложения и сервера любой сложности
		</p>


		<div class="tech-stack">
			{#each techStack as tech, index}
				<span class="badge" class:visible={badgesVisible[index]}>{tech}</span>
			{/each}
		</div>

		<div class="projects">
			<h2 class="section-title">Проекты</h2>
			<div class="projects-carousel">
				<button 
					class="carousel-btn prev" 
					on:click={prevProject}
					disabled={!canGoPrev}
					aria-label="Предыдущий проект"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
				</button>
				
				<div class="projects-grid">
					{#each visibleProjects as project (project.title)}
						<div 
							class="project-card visible"
							on:click={() => openModal(project)}
							on:keydown={(e) => e.key === 'Enter' && openModal(project)}
							role="button"
							tabindex="0"
						>
							<img src={project.image} alt={project.title} class="project-img">
							<div class="project-info">
								<h3>{project.title}</h3>
								<p>{project.description}</p>
							</div>
						</div>
					{/each}
				</div>

				<button 
					class="carousel-btn next" 
					on:click={nextProject}
					disabled={!canGoNext}
					aria-label="Следующий проект"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>
			</div>
		</div>

		<div class="social-links">
			<a href="https://t.me/username7052" target="_blank" rel="noopener noreferrer" class="social-btn">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" fill="currentColor"/>
				</svg>
				<span>Telegram</span>
			</a>
			<a href="https://discord.com/users/f14my1" target="_blank" rel="noopener noreferrer" class="social-btn">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" fill="currentColor"/>
				</svg>
				<span>Discord</span>
			</a>
		</div>
        <!-- Visitors Counter -->
		<div class="visitors-counter">
			{#if visitorsLoading}
				<div class="visitors-loading">
					<div class="spinner"></div>
				</div>
			{:else}
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
					<circle cx="12" cy="12" r="3"></circle>
				</svg>
				<span>{visitorsCount?.toLocaleString('ru-RU') || 0} посетителей</span>
			{/if}
		</div>
	</div>
	</div>

	<!-- Comments Section -->
	<div class="comments-section">
		<div class="comments-header">
			<h2 class="section-title">Комментарии</h2>
			<button 
				on:click={() => showCommentForm = !showCommentForm} 
				class="toggle-form-btn"
			>
				{showCommentForm ? '✕' : '+ Написать'}
			</button>
		</div>
		
		<!-- Comment Form -->
		{#if showCommentForm}
		<div class="comment-form">
			<input 
				type="text" 
				bind:value={commentName} 
				placeholder="Ваше имя"
				maxlength="50"
				disabled={commentSubmitting}
				class="comment-input"
			/>
			<textarea 
				bind:value={commentText} 
				placeholder="Ваш комментарий (макс. 500 символов)"
				maxlength="500"
				rows="3"
				disabled={commentSubmitting}
				class="comment-textarea"
			></textarea>
			
			{#if commentError}
				<div class="comment-error">{commentError}</div>
			{/if}
			
			{#if commentSuccess}
				<div class="comment-success">Комментарий успешно добавлен!</div>
			{/if}
			
			<button 
				on:click={submitComment} 
				disabled={commentSubmitting || !commentName.trim() || !commentText.trim()}
				class="comment-submit"
			>
				{#if commentSubmitting}
					<div class="spinner small"></div>
					<span>Отправка...</span>
				{:else}
					Отправить
				{/if}
			</button>
		</div>
		{/if}

		<!-- Comments List -->
		<div class="comments-list">
			{#if comments.length === 0 && !commentsLoading}
				<div class="no-comments">Пока нет комментариев. Будьте первым!</div>
			{/if}
			
			{#each comments as comment (comment.id)}
				<div class="comment-item">
					<div class="comment-header">
						<span class="comment-author">{comment.name}</span>
						<span class="comment-date">{formatDate(comment.timestamp)}</span>
					</div>
					<div class="comment-text">{comment.text}</div>
				</div>
			{/each}
			
			{#if commentsLoading}
				<div class="comments-loading">
					<div class="spinner"></div>
					<span>Загрузка комментариев...</span>
				</div>
			{/if}
			
			{#if commentsHasMore && !commentsLoading}
				<button on:click={loadComments} class="load-more-btn">
					Загрузить еще
				</button>
			{/if}
		</div>
	</div>
</div>

{#if showModal}
	<div class="modal" class:show={showModal} on:click={closeModal} on:keydown={(e) => e.key === 'Enter' && closeModal()} role="dialog" aria-modal="true" tabindex="-1">
		<span class="modal-close" on:click={closeModal} on:keydown={(e) => e.key === 'Enter' && closeModal()} role="button" tabindex="0">&times;</span>
		<img class="modal-content" src={modalImage} alt="Project preview">
		<div class="modal-caption">{modalCaption}</div>
	</div>
{/if}

<style>
	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
		background: #000000;
		color: #ffffff;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:global(*) {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.page-wrapper {
		width: 100%;
		min-height: 100vh;
		padding: 20px;
	}

	.container {
		width: 100%;
		max-width: 600px;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		margin: 0 auto;
	}

	.card {
		background: #0a0a0a;
		border: 1px solid #151515;
		border-radius: 16px;
		padding: 40px;
		width: 100%;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
		position: relative;
		opacity: 0;
		transform: translateY(20px);
		transition: opacity 0.6s ease, transform 0.6s ease;
	}

	.card.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.header {
		font-family: "Elms Sans", sans-serif;
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 20px;
	}

	.avatar {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		border: 2px solid #333333;
		object-fit: cover;
		transition: transform 0.3s ease;
		flex-shrink: 0;
	}

	.avatar:hover {
		transform: scale(1.05);
		border-color: #555555;
	}

	h1 {
		font-size: 26px;
		font-weight: 500;
		margin-bottom: 4px;
		letter-spacing: 1px;
	}

	.age {
		color: #888888;
		font-size: 15px;
	}

	.description {
		text-align: center;
		color: #cccccc;
		font-size: 15px;
		line-height: 1.6;
		margin-bottom: 12px;
	}

	.visitors-counter {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 20px;
		color: #888888;
		font-size: 13px;
		font-weight: 500;
	}

	.visitors-counter svg {
		opacity: 0.7;
	}

	.visitors-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 20px;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid #333333;
		border-top-color: #888888;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.tech-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
		margin-bottom: 24px;
	}

	.badge {
		background: #1a1a1a;
		color: #ffffff;
		padding: 5px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 500;
		border: 1px solid #252525;
		transition: all 0.2s ease;
		cursor: default;
		opacity: 0;
		transform: scale(0.8);
	}

	.badge.visible {
		opacity: 1;
		transform: scale(1);
		transition: opacity 0.3s ease, transform 0.3s ease;
	}

	.badge:hover {
		background: #252525;
		border-color: #303030;
		transform: translateY(-2px);
	}

	.projects {
		margin-bottom: 24px;
	}

	.section-title {
		font-size: 18px;
		font-weight: 600;
		text-align: center;
		margin-bottom: 16px;
		color: #ffffff;
	}

	.projects-carousel {
		display: flex;
		align-items: center;
		gap: 12px;
		position: relative;
	}

	.carousel-btn {
		background: #1a1a1a;
		border: 1px solid #252525;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s ease;
		flex-shrink: 0;
		color: #ffffff;
	}

	.carousel-btn:hover:not(:disabled) {
		background: #252525;
		border-color: #303030;
		transform: scale(1.1);
	}

	.carousel-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.carousel-btn svg {
		flex-shrink: 0;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		flex: 1;
		position: relative;
	}

	.project-card {
		background: #0f0f0f;
		border: 1px solid #1a1a1a;
		border-radius: 12px;
		overflow: hidden;
		cursor: pointer;
		animation: slideIn 0.4s ease-out;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.project-card.visible {
		opacity: 1;
		transform: translateX(0);
	}

	.project-card:hover {
		border-color: #252525;
		transform: translateY(-3px);
		box-shadow: 0 8px 24px rgba(255, 255, 255, 0.03);
	}

	.project-img {
		width: 100%;
		height: 140px;
		object-fit: cover;
		display: block;
	}

	.project-info {
		padding: 12px;
	}

	.project-info h3 {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 4px;
		color: #ffffff;
	}

	.project-info p {
		font-size: 12px;
		color: #888888;
		line-height: 1.4;
	}

	.social-links {
		display: flex;
		gap: 12px;
		margin-top: 30px;
		justify-content: center;
	}

	.social-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 14px 28px;
		background-color: #0c0c0c;
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 12px;
		color: #ffffff;
		text-decoration: none;
		font-size: 15px;
		font-weight: 500;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.social-btn::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		transition: opacity 0.4s ease;
	}

	.social-btn:hover::before {
		opacity: 1;
	}

	.social-btn:hover {
		transform: translateY(-3px);
		border-color: rgba(255, 255, 255, 0.2);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
	}

	.social-btn:active {
		transform: translateY(-1px);
	}

	.social-btn svg {
		flex-shrink: 0;
		transition: transform 0.3s ease;
	}

	.social-btn:hover svg {
		transform: scale(1.1) rotate(5deg);
	}

	.social-btn span {
		position: relative;
		z-index: 1;
	}

	/* Modal styles */
	.modal {
		display: none;
		position: fixed;
		z-index: 1000;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.95);
		animation: fadeIn 0.3s ease;
	}

	.modal.show {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.modal-close {
		position: absolute;
		top: 20px;
		right: 35px;
		color: #ffffff;
		font-size: 40px;
		font-weight: 300;
		cursor: pointer;
		transition: color 0.2s ease;
		z-index: 1001;
	}

	.modal-close:hover {
		color: #888888;
	}

	.modal-content {
		max-width: 90vw;
		max-height: 80vh;
		width: auto;
		height: auto;
		object-fit: contain;
		border-radius: 8px;
		animation: zoomIn 0.3s ease;
	}

	@keyframes zoomIn {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	.modal-caption {
		margin-top: 20px;
		text-align: center;
		color: #cccccc;
		font-size: 16px;
		max-width: 90vw;
		padding: 0 20px;
	}

	/* Comments Section */
	.comments-section {
		background: transparent;
		border: none;
		border-radius: 0;
		padding: 20px 0;
		width: 100%;
		max-width: 600px;
		margin: -110px auto 40px;
		box-shadow: none;
	}

	.comments-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		gap: 12px;
	}

	.comments-section .section-title {
		font-size: 14px;
		font-weight: 400;
		color: #888888;
		margin-bottom: 0;
		text-align: left;
	}

	.toggle-form-btn {
		background: transparent;
		color: #888888;
		border: 1px solid #1a1a1a;
		border-radius: 6px;
		padding: 6px 12px;
		font-size: 12px;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
	}

	.toggle-form-btn:hover {
		background: #0f0f0f;
		border-color: #252525;
		color: #aaaaaa;
	}

	.comment-form {
		margin-bottom: 30px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.comment-input,
	.comment-textarea {
		background: #0f0f0f;
		border: 1px solid #1a1a1a;
		border-radius: 6px;
		padding: 10px 12px;
		color: #cccccc;
		font-size: 13px;
		font-family: inherit;
		transition: border-color 0.2s ease;
		width: 100%;
	}

	.comment-input:focus,
	.comment-textarea:focus {
		outline: none;
		border-color: #252525;
	}

	.comment-input::placeholder,
	.comment-textarea::placeholder {
		color: #555555;
	}

	.comment-textarea {
		resize: vertical;
		min-height: 80px;
	}

	.comment-error {
		color: #ff6b6b;
		font-size: 13px;
		padding: 8px 12px;
		background: rgba(255, 107, 107, 0.1);
		border-radius: 6px;
		border: 1px solid rgba(255, 107, 107, 0.2);
	}

	.comment-success {
		color: #51cf66;
		font-size: 13px;
		padding: 8px 12px;
		background: rgba(81, 207, 102, 0.1);
		border-radius: 6px;
		border: 1px solid rgba(81, 207, 102, 0.2);
	}

	.comment-submit {
		background: #1a1a1a;
		color: #aaaaaa;
		border: 1px solid #252525;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		align-self: flex-start;
	}

	.comment-submit:hover:not(:disabled) {
		background: #252525;
		border-color: #303030;
		color: #cccccc;
	}

	.comment-submit:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.spinner.small {
		width: 14px;
		height: 14px;
		border-width: 2px;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.no-comments {
		text-align: center;
		color: #666666;
		padding: 30px 20px;
		font-size: 13px;
	}

	.comment-item {
		background: transparent;
		border: none;
		border-bottom: 1px solid #1a1a1a;
		border-radius: 0;
		padding: 12px 0;
		transition: border-color 0.2s ease;
	}

	.comment-item:hover {
		border-bottom-color: #252525;
	}

	.comment-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		gap: 12px;
	}

	.comment-author {
		color: #aaaaaa;
		font-weight: 500;
		font-size: 13px;
	}

	.comment-date {
		color: #666666;
		font-size: 11px;
	}

	.comment-text {
		color: #999999;
		font-size: 13px;
		line-height: 1.5;
		word-wrap: break-word;
	}

	.comments-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 20px;
		color: #888888;
		font-size: 14px;
	}

	.load-more-btn {
		background: transparent;
		color: #777777;
		border: 1px solid #1a1a1a;
		border-radius: 6px;
		padding: 8px 16px;
		font-size: 12px;
		font-weight: 400;
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		margin-top: 8px;
	}

	.load-more-btn:hover {
		background: #0f0f0f;
		border-color: #252525;
		color: #999999;
	}

	/* Responsive */
	@media (max-width: 640px) {
		.page-wrapper {
			padding: 15px;
		}

		.card {
			padding: 30px 20px;
		}

		.header {
			flex-direction: column;
			text-align: center;
			gap: 15px;
		}

		.avatar {
			width: 100px;
			height: 100px;
		}

		h1 {
			font-size: 28px;
		}

		.description {
			font-size: 14px;
		}

		.badge {
			font-size: 11px;
			padding: 4px 10px;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}

		.carousel-btn {
			width: 32px;
			height: 32px;
		}

		.carousel-btn svg {
			width: 16px;
			height: 16px;
		}

		.project-card {
			padding: 12px;
		}

		.project-info h3 {
			font-size: 16px;
		}

		.project-info p {
			font-size: 12px;
		}

		.social-btn {
			padding: 12px 20px;
			font-size: 14px;
		}
		
		.social-links {
			flex-direction: column;
			gap: 10px;
		}

		.modal-close {
			top: 10px;
			right: 15px;
			font-size: 35px;
		}
		
		.modal-content {
			max-width: 95vw;
			max-height: 70vh;
		}
		
		.modal-caption {
			font-size: 14px;
			margin-top: 15px;
			padding: 0 15px;
		}

		.comments-section {
			padding: 15px 0;
			margin-top: -60px;
		}

		.comment-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 4px;
		}
	}
</style>
