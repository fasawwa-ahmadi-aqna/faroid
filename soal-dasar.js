/**
 * Bank soal statis (10 soal dasar).
 * Struktur: { versi, tingkat, soal: [...] }
 */
const BANK_SOAL = {
  versi: "1.0",
  tingkat: "dasar",
  soal: [
    {
      id: "FAR-001",
      judul: "Suami tanpa anak",
      kategori: ["ashabul-furud", "pasangan"],
      kasus: {
        harta: 120000000,
        ahliWaris: [{ jenis: "suami", jumlah: 1 }],
      },
      pertanyaan: "Berapa bagian suami?",
      jawaban: {
        asalMasalah: 2,
        status: "normal",
        bagian: [
          { jenis: "suami", jumlah: 1, pecahan: "1/2", nominal: 60000000 },
        ],
      },
      pembahasan: [
        "Suami mendapat 1/2 karena tidak ada far'u waris (anak/cucu).",
        "Asal masalah = 2 (penyebut 1/2).",
        "Nominal = 120jt × 1/2 = 60jt.",
      ],
    },
    {
      id: "FAR-002",
      judul: "Istri dan anak laki-laki",
      kategori: ["ashabul-furud", "ashabah"],
      kasus: {
        harta: 240000000,
        ahliWaris: [
          { jenis: "istri", jumlah: 1 },
          { jenis: "anakL", jumlah: 1 },
        ],
      },
      pertanyaan: "Hitung bagian istri dan anak laki-laki.",
      jawaban: {
        asalMasalah: 8,
        status: "normal",
        bagian: [
          { jenis: "istri", jumlah: 1, pecahan: "1/8", nominal: 30000000 },
          { jenis: "anakL", jumlah: 1, pecahan: "sisa", nominal: 210000000 },
        ],
      },
      pembahasan: [
        "Istri 1/8 karena ada far'u waris.",
        "Anak laki-laki ashabah bin nafsi, mengambil sisa.",
        "Asal masalah = 8. Saham istri 1, sisa 7 untuk anak.",
        "Nominal: istri 30jt, anak 210jt.",
      ],
    },
    {
      id: "FAR-003",
      judul: "Ayah, ibu, dan anak laki-laki",
      kategori: ["ashabul-furud", "ashabah"],
      kasus: {
        harta: 120000000,
        ahliWaris: [
          { jenis: "ayah", jumlah: 1 },
          { jenis: "ibu", jumlah: 1 },
          { jenis: "anakL", jumlah: 1 },
        ],
      },
      pertanyaan: "Hitung bagian masing-masing ahli waris.",
      jawaban: {
        asalMasalah: 6,
        status: "normal",
        bagian: [
          { jenis: "ayah", jumlah: 1, pecahan: "1/6", nominal: 20000000 },
          { jenis: "ibu", jumlah: 1, pecahan: "1/6", nominal: 20000000 },
          { jenis: "anakL", jumlah: 1, pecahan: "sisa", nominal: 80000000 },
        ],
      },
      pembahasan: [
        "Ayah 1/6 karena ada far'u waris.",
        "Ibu 1/6 karena ada far'u waris.",
        "Anak laki-laki ashabah, mengambil sisa.",
        "Asal masalah = 6. Saham: ayah 1, ibu 1, sisa 4 untuk anak.",
        "Nominal: ayah 20jt, ibu 20jt, anak 80jt.",
      ],
    },
    {
      id: "FAR-004",
      judul: "Ibu dan anak perempuan (radd)",
      kategori: ["radd", "ashabul-furud"],
      kasus: {
        harta: 60000000,
        ahliWaris: [
          { jenis: "ibu", jumlah: 1 },
          { jenis: "anakP", jumlah: 1 },
        ],
      },
      pertanyaan: "Berapa bagian ibu dan anak perempuan? Apakah ada radd?",
      jawaban: {
        asalMasalah: 6,
        status: "radd",
        bagian: [
          { jenis: "ibu", jumlah: 1, pecahan: "1/4", nominal: 15000000 },
          { jenis: "anakP", jumlah: 1, pecahan: "3/4", nominal: 45000000 },
        ],
      },
      pembahasan: [
        "Ibu 1/6 karena ada far'u waris; anak perempuan 1/2 (sendiri).",
        "Asal masalah = 6. Saham: ibu 1, anak 3. Total 4, sisa 2.",
        "Tidak ada ashabah → radd (selain suami/istri).",
        "Perbandingan saham 1:3 → ibu 1/4, anak 3/4.",
        "Nominal: ibu 15jt, anak 45jt.",
      ],
    },
    {
      id: "FAR-005",
      judul: "Istri dan dua anak perempuan",
      kategori: ["ashabul-furud", "radd"],
      kasus: {
        harta: 160000000,
        ahliWaris: [
          { jenis: "istri", jumlah: 1 },
          { jenis: "anakP", jumlah: 2 },
        ],
      },
      pertanyaan: "Hitung bagian istri dan dua anak perempuan.",
      jawaban: {
        asalMasalah: 24,
        status: "normal",
        bagian: [
          { jenis: "istri", jumlah: 1, pecahan: "1/8", nominal: 20000000 },
          { jenis: "anakP", jumlah: 2, pecahan: "7/8", nominal: 140000000 },
        ],
      },
      pembahasan: [
        "Istri 1/8 karena ada far'u waris.",
        "Dua anak perempuan 2/3 (tidak ada anak laki-laki).",
        "Sisa setelah istri dan 2/3 = 5/24 diberikan radd ke anak perempuan.",
        "Anak pr total = 2/3 + 5/24 = 7/8. Nominal = 140jt (70jt/orang).",
      ],
    },
    {
      id: "FAR-006",
      judul: "Suami, ibu, ayah (Gharrawain)",
      kategori: ["kasus-khusus", "gharrawain"],
      kasus: {
        harta: 120000000,
        ahliWaris: [
          { jenis: "suami", jumlah: 1 },
          { jenis: "ibu", jumlah: 1 },
          { jenis: "ayah", jumlah: 1 },
        ],
      },
      pertanyaan: "Berapa bagian ibu? Jelaskan kasus gharrawain.",
      jawaban: {
        asalMasalah: 6,
        status: "normal",
        bagian: [
          { jenis: "suami", jumlah: 1, pecahan: "1/2", nominal: 60000000 },
          { jenis: "ibu", jumlah: 1, pecahan: "1/6", nominal: 20000000 },
          { jenis: "ayah", jumlah: 1, pecahan: "sisa", nominal: 40000000 },
        ],
      },
      pembahasan: [
        "Suami 1/2 karena tidak ada far'u waris.",
        "Ayah ashabah (bukan 1/6 karena tidak ada far'u waris).",
        "Kasus Gharrawain: ibu mendapat 1/3 dari SISA setelah suami.",
        "Sisa = 1/2. Ibu = 1/3 × 1/2 = 1/6 total.",
        "Ayah = sisa = 1 - 1/2 - 1/6 = 1/3 = 2/6.",
        "Nominal: suami 60jt, ibu 20jt, ayah 40jt.",
      ],
    },
    {
      id: "FAR-007",
      judul: "Anak lk, anak pr, ayah, ibu",
      kategori: ["ashabah-bil-ghair", "hijab"],
      kasus: {
        harta: 360000000,
        ahliWaris: [
          { jenis: "anakL", jumlah: 1 },
          { jenis: "anakP", jumlah: 1 },
          { jenis: "ayah", jumlah: 1 },
          { jenis: "ibu", jumlah: 1 },
        ],
      },
      pertanyaan: "Hitung bagian. Mengapa anak perempuan bukan 1/2?",
      jawaban: {
        asalMasalah: 6,
        status: "normal",
        bagian: [
          { jenis: "ayah", jumlah: 1, pecahan: "1/6", nominal: 60000000 },
          { jenis: "ibu", jumlah: 1, pecahan: "1/6", nominal: 60000000 },
          { jenis: "anakL", jumlah: 1, pecahan: "4/9", nominal: 160000000 },
          { jenis: "anakP", jumlah: 1, pecahan: "2/9", nominal: 80000000 },
        ],
      },
      pembahasan: [
        "Ayah 1/6 dan ibu 1/6 karena ada far'u waris.",
        "Anak perempuan tidak 1/2 karena ada anak laki-laki (ashabah bil ghair).",
        "Sisa = 1 - 1/6 - 1/6 = 2/3, dibagi 2:1.",
        "Anak lk = 2/3 × 2/3 = 4/9; anak pr = 2/3 × 1/3 = 2/9.",
        "Nominal: ayah 60jt, ibu 60jt, anak lk 160jt, anak pr 80jt.",
      ],
    },
    {
      id: "FAR-008",
      judul: "Cucu laki-laki terhijab anak laki-laki",
      kategori: ["hijab-hirman"],
      kasus: {
        harta: 100000000,
        ahliWaris: [
          { jenis: "anakL", jumlah: 1 },
          { jenis: "cucuL", jumlah: 1 },
          { jenis: "ibu", jumlah: 1 },
        ],
      },
      pertanyaan: "Apakah cucu laki-laki mendapat warisan?",
      jawaban: {
        asalMasalah: 6,
        status: "normal",
        bagian: [
          { jenis: "ibu", jumlah: 1, pecahan: "1/6", nominal: 16666667 },
          { jenis: "anakL", jumlah: 1, pecahan: "sisa", nominal: 83333333 },
          { jenis: "cucuL", jumlah: 1, pecahan: "0", nominal: 0 },
        ],
      },
      pembahasan: [
        "Cucu laki-laki terhijab hirman oleh anak laki-laki.",
        "Ibu 1/6 karena ada far'u waris.",
        "Anak laki-laki ashabah, mengambil sisa 5/6.",
        "Nominal dibulatkan; engine harus pakai pecahan rasional.",
      ],
    },
    {
      id: "FAR-009",
      judul: "Suami, ibu, dua saudara perempuan kandung (aul)",
      kategori: ["aul"],
      kasus: {
        harta: 80000000,
        ahliWaris: [
          { jenis: "suami", jumlah: 1 },
          { jenis: "saudaraPK", jumlah: 2 },
          { jenis: "ibu", jumlah: 1 },
        ],
      },
      pertanyaan: "Hitung bagian. Apakah terjadi aul?",
      jawaban: {
        asalMasalah: 8,
        status: "aul",
        bagian: [
          { jenis: "suami", jumlah: 1, pecahan: "3/8", nominal: 30000000 },
          { jenis: "saudaraPK", jumlah: 2, pecahan: "4/8", nominal: 40000000 },
          { jenis: "ibu", jumlah: 1, pecahan: "1/8", nominal: 10000000 },
        ],
      },
      pembahasan: [
        "Suami 1/2; 2 saudara pr kandung 2/3; ibu 1/6 (ada 2+ saudara).",
        "Asal masalah = 6. Saham: 3 + 4 + 1 = 8 > 6 → AUL ke 8.",
        "Bagian proporsional terhadap 8: suami 3/8, saudara 4/8, ibu 1/8.",
        "Nominal: suami 30jt, saudara 40jt (20jt/orang), ibu 10jt.",
      ],
    },
    {
      id: "FAR-010",
      judul: "Istri, ibu, dan ayah",
      kategori: ["ashabul-furud", "ashabah"],
      kasus: {
        harta: 240000000,
        ahliWaris: [
          { jenis: "istri", jumlah: 1 },
          { jenis: "ibu", jumlah: 1 },
          { jenis: "ayah", jumlah: 1 },
        ],
      },
      pertanyaan: "Hitung bagian istri, ibu, dan ayah.",
      jawaban: {
        asalMasalah: 12,
        status: "normal",
        bagian: [
          { jenis: "istri", jumlah: 1, pecahan: "1/4", nominal: 60000000 },
          { jenis: "ibu", jumlah: 1, pecahan: "1/3", nominal: 80000000 },
          { jenis: "ayah", jumlah: 1, pecahan: "sisa", nominal: 100000000 },
        ],
      },
      pembahasan: [
        "Istri 1/4 karena tidak ada far'u waris.",
        "Ibu 1/3 karena tidak ada far'u waris dan tidak ada 2+ saudara.",
        "Ayah ashabah, mengambil sisa.",
        "Sisa = 1 - 1/4 - 1/3 = 5/12. Nominal ayah = 240jt × 5/12 = 100jt.",
      ],
    },
  ],
};
