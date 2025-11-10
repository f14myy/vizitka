import { json } from '@sveltejs/kit';
import { kv } from '@vercel/kv';

const COMMENTS_KEY = 'comments:list';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '5');
		
		// Получаем все комментарии из KV
		const comments = await kv.get(COMMENTS_KEY) || [];
		
		// Сортируем по дате (новые первыми)
		const sortedComments = comments.sort((a, b) => 
			new Date(b.timestamp) - new Date(a.timestamp)
		);
		
		// Пагинация
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedComments = sortedComments.slice(startIndex, endIndex);
		
		return json({
			comments: paginatedComments,
			total: comments.length,
			page,
			hasMore: endIndex < comments.length
		});
	} catch (error) {
		console.error('Error getting comments:', error);
		return json({
			comments: [],
			total: 0,
			page: 1,
			hasMore: false
		});
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const body = await request.json();
		
		// Валидация
		if (!body.name || !body.text) {
			return json({ error: 'Имя и текст комментария обязательны' }, { status: 400 });
		}
		
		if (body.name.length > 50) {
			return json({ error: 'Имя слишком длинное (макс. 50 символов)' }, { status: 400 });
		}
		
		if (body.text.length > 500) {
			return json({ error: 'Комментарий слишком длинный (макс. 500 символов)' }, { status: 400 });
		}
		
		// Создаем новый комментарий
		const newComment = {
			id: Date.now().toString(),
			name: body.name.trim(),
			text: body.text.trim(),
			timestamp: new Date().toISOString()
		};
		
		// Получаем существующие комментарии
		const comments = await kv.get(COMMENTS_KEY) || [];
		
		// Добавляем новый комментарий
		comments.push(newComment);
		
		// Сохраняем обратно в KV
		await kv.set(COMMENTS_KEY, comments);
		
		return json({ success: true, comment: newComment }, { status: 201 });
	} catch (error) {
		console.error('Error posting comment:', error);
		return json({ error: 'Ошибка при сохранении комментария' }, { status: 500 });
	}
}
