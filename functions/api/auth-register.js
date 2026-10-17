async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { username, password } = await request.json();

  if (!username || !password) {
    return new Response('Missing data', { status: 400 });
  }

  const hash = await hashPassword(password);

  try {
    // Если имя пользователя 'admin', даем ему роль администратора, иначе - игрок
    const role = username.toLowerCase() === 'admin' ? 'admin' : 'player';

    await env.DB.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
      .bind(username, hash, role).run();
      
    return new Response('OK', { status: 200 });
  } catch (e) {
    // Если такое имя уже есть, база вернет ошибку UNIQUE
    if (e.message.includes('UNIQUE')) {
      return new Response('Это имя уже занято', { status: 400 });
    }
    return new Response('DB error: ' + e.message, { status: 500 });
  }
}
