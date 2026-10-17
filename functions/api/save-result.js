export async function onRequestPost(context) {
  const { request, env } = context;
  const { playerName, word, score, result, wordLength, difficulty, orderType } = await request.json();

  if (!playerName || !word) {
    return new Response('Missing data', { status: 400 });
  }

  try {
    await env.DB.prepare(
      'INSERT INTO game_results (player_name, word, score, result, word_length, difficulty, order_type) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(playerName, word, score, result, wordLength, difficulty, orderType).run();
    return new Response('OK', { status: 200 });
  } catch (e) {
    return new Response('DB error: ' + e.message, { status: 500 });
  }
}
