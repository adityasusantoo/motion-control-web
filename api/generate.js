// Konfigurasi agar Vercel menggunakan Edge Runtime (lebih cepat & support FormData)
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Hanya izinkan request dengan metode POST
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method Not Allowed. Gunakan POST.' }), 
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // 1. Ambil API Key dari header yang dikirim oleh index.html
    const apiKey = request.headers.get('x-user-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key tidak ditemukan di header request.' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Ambil data Form (Gambar, Video, Prompt, dll) dari request HTML
    const formData = await request.formData();

    /* ==========================================
       CATATAN PENTING:
       Pastikan URL ini benar sesuai dokumentasi Magnific.
       Misalnya: https://api.magnific.ai/v1/motion 
       ========================================== */
    const magnificApiUrl = 'https://api.magnific.ai/v1/motion';

    // 3. Teruskan (Forward) request tersebut ke server API Magnific
    const magnificResponse = await fetch(magnificApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Jangan tambahkan Content-Type, biarkan fetch yang mengaturnya otomatis
      },
      body: formData
    });

    // 4. Ambil balasan dari Magnific
    const data = await magnificResponse.json();

    // 5. Kembalikan balasan Magnific ke index.html kita
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