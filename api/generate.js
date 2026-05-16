export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed. Gunakan POST.' }), 
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const apiKey = request.headers.get('x-user-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key tidak ditemukan.' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const formData = await request.formData();

    /* ==========================================
       PASTIKAN URL INI BENAR!
       Cek dokumentasi Magnific.ai untuk URL Motion API mereka.
       ========================================== */
    const magnificApiUrl = 'https://api.magnific.ai/v1/motion'; 

    const magnificResponse = await fetch(magnificApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData
    });

    // KITA BACA SEBAGAI TEKS DULU, JANGAN LANGSUNG JADIKAN JSON
    const responseText = await magnificResponse.text();

    let data;
    try {
      // Coba ubah teks tersebut menjadi JSON
      data = JSON.parse(responseText);
    } catch (parseError) {
      // Jika gagal (berarti Magnific mengirim HTML), tampilkan isi HTML-nya agar kita tahu errornya!
      console.error("Bukan JSON! Respons dari Magnific:", responseText);
      return new Response(
        JSON.stringify({ 
          error: `API Magnific mengirim HTML, bukan data. Status Kode: ${magnificResponse.status}. Cuplikan: ${responseText.substring(0, 100)}... Pastikan URL API sudah benar.` 
        }), 
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Jika sukses jadi JSON, kirim balik ke website
    return new Response(JSON.stringify(data), {
      status: magnificResponse.status,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Backend Error:', error);
    return new Response(
      JSON.stringify({ error: 'Gagal memproses request di server Vercel: ' + error.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
