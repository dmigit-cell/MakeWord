export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const playerName = url.searchParams.get('player');
  const authHeader = request.headers.get('Authorization');

  let results;

  try {
    if (playerName) {
      // Запрос для конкретного игрока (личный кабинет)
      const { results: r } = await env.DB.prepare(
        'SELECT * FROM game_results WHERE player_name = ? ORDER BY played_at DESC LIMIT 50'
      ).bind(playerName).all();
      results = r;
    } else if (authHeader === 'Bearer admin123') {
      // Запрос для админа (все игры)
      const { results: r } = await env.DB.prepare(
        'SELECT * FROM game_results ORDER BY played_at DESC LIMIT 100'
      ).all();
      results = r;
    } else {
      return new Response('Unauthorized', { status: 401 });
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response('DB error: ' + e.message, { status: 500 });
  }
}
