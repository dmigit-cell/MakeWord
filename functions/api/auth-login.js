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
    const user = await env.DB.prepare('SELECT id, username, role FROM users WHERE username = ? AND password_hash = ?')
      .bind(username, hash).first();

    if (!user) {
      return new Response('Неверное имя или пароль', { status: 401 });
    }

    return new Response(JSON.stringify(user), { 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (e) {
    return new Response('DB error: ' + e.message, { status: 500 });
  }
}
