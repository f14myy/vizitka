import { json } from '@sveltejs/kit';
import { kv } from '@vercel/kv';

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	try {
		const count = await kv.get('visitors:count') || 0;
		return json({ count });
	} catch (error) {
		console.error('Error getting visitors count:', error);
		return json({ count: 0 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, getClientAddress }) {
	try {
		const clientIP = getClientAddress();
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const timestamp = Date.now();
		
		// Ключ для проверки уникальности посетителя (IP + день)
		const today = new Date().toISOString().split('T')[0];
		const visitorKey = `visitor:${clientIP}:${today}`;
		
		// Проверяем, был ли этот посетитель сегодня
		const hasVisited = await kv.get(visitorKey);
		
		if (!hasVisited) {
			// Увеличиваем счетчик
			await kv.incr('visitors:count');
			
			// Отмечаем посетителя (ключ истекает через 24 часа)
			await kv.set(visitorKey, { userAgent, timestamp }, { ex: 86400 });
		}
		
		const count = await kv.get('visitors:count') || 0;
		return json({ count, isNew: !hasVisited });
	} catch (error) {
		console.error('Error recording visitor:', error);
		const count = await kv.get('visitors:count') || 0;
		return json({ count, isNew: false });
	}
}
