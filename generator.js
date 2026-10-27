/**
 * Generator soal faraid berbasis template.
 * Memakai Fraction.js (global `Fraction`).
 */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatRupiah(n) {
  return "Rp " + Math.round(n).toLocaleString("id-ID");
}

// ============ TEMPLATE ============
const TEMPLATES = [
  {
    kode: "T1",
    judul: () => "Pasangan tanpa anak",
    kategori: ["ashabul-furud", "pasangan"],
    buatAhliWaris: () => [{ jenis: "suami", jumlah: 1 }],
    hitung: (harta) => {
      const frac = new Fraction(1, 2);
      return {
        asalMasalah: 2,
        status: "normal",
        bagian: [
          { jenis: "suami", jumlah: 1, pecahan: "1/2", nominal: harta * frac.valueOf() },
        ],
        pembahasan: [
          "Suami mendapat 1/2 karena tidak ada far'u waris.",
          "Asal masalah = 2.",
          `Nominal = ${formatRupiah(harta)} × 1/2 = ${formatRupiah(harta / 2)}.`,
        ],
      };
    },
  },
  {
    kode: "T2",
    judul: () => "Istri dan anak laki-laki",
    kategori: ["ashabul-furud", "ashabah"],
    buatAhliWaris: () => [
      { jenis: "istri", jumlah: 1 },
      { jenis: "anakL", jumlah: randInt(1, 3) },
    ],
    hitung: (harta, aw) => {
      const nAnak = aw.find((a) => a.jenis === "anakL").jumlah;
      const sisaFrac = new Fraction(1).sub(new Fraction(1, 8)); // 7/8
      const perAnak = sisaFrac.div(nAnak);
      return {
        asalMasalah: 8 * nAnak,
        status: "normal",
        bagian: [
          { jenis: "istri", jumlah: 1, pecahan: "1/8", nominal: harta / 8 },
          {
            jenis: "anakL",
            jumlah: nAnak,
            pecahan: sisaFrac.toFraction(),
            nominal: harta * sisaFrac.valueOf(),
          },
        ],
        pembahasan: [
          "Istri 1/8 karena ada far'u waris.",
          `Anak laki-laki (${nAnak} orang) ashabah, mengambil sisa 7/8.`,
          `Sisa dibagi rata: ${perAnak.toFraction()} per anak.`,
          `Nominal istri = ${formatRupiah(harta / 8)}.`,
          `Nominal total anak = ${formatRupiah(harta * 7 / 8)}.`,
        ],
      };
    },
  },
  {
    kode: "T3",
    judul: () => "Ayah, ibu, dan anak laki-laki",
    kategori: ["ashabul-furud", "ashabah"],
    buatAhliWaris: () => [
      { jenis: "ayah", jumlah: 1 },
      { jenis: "ibu", jumlah: 1 },
      { jenis: "anakL", jumlah: randInt(1, 3) },
    ],
    hitung: (harta, aw) => {
      const nAnak = aw.find((a) => a.jenis === "anakL").jumlah;
      const sisaFrac = new Fraction(1).sub(new Fraction(1, 6)).sub(new Fraction(1, 6)); // 2/3
      return {
        asalMasalah: 6,
        status: "normal",
        bagian: [
          { jenis: "ayah", jumlah: 1, pecahan: "1/6", nominal: harta / 6 },
          { jenis: "ibu", jumlah: 1, pecahan: "1/6", nominal: harta / 6 },
          {
            jenis: "anakL",
            jumlah: nAnak,
            pecahan: sisaFrac.toFraction(),
            nominal: harta * sisaFrac.valueOf(),
          },
        ],
        pembahasan: [
          "Ayah 1/6 dan ibu 1/6 karena ada far'u waris.",
          `Anak laki-laki (${nAnak} orang) ashabah, mengambil sisa 2/3.`,
          `Nominal: ayah ${formatRupiah(harta / 6)}, ibu ${formatRupiah(harta / 6)}, total anak ${formatRupiah(harta * 2 / 3)}.`,
        ],
      };
    },
  },
  {
    kode: "T4",
    judul: () => "Ibu dan anak perempuan (radd)",
    kategori: ["radd"],
    buatAhliWaris: () => [
      { jenis: "ibu", jumlah: 1 },
      { jenis: "anakP", jumlah: randInt(1, 3) },
    ],
    hitung: (harta, aw) => {
      const nAnak = aw.find((a) => a.jenis === "anakP").jumlah;
      const ibuAwal = new Fraction(1, 6);
      const anakAwal = nAnak === 1 ? new Fraction(1, 2) : new Fraction(2, 3);
      const totalAwal = ibuAwal.add(anakAwal);
      const rasioIbu = ibuAwal.div(totalAwal);
      const rasioAnak = anakAwal.div(totalAwal);
      const ibuAkhir = new Fraction(1).mul(rasioIbu);
      const anakAkhir = new Fraction(1).mul(rasioAnak);

      return {
        asalMasalah: 6,
        status: "radd",
        bagian: [
          { jenis: "ibu", jumlah: 1, pecahan: ibuAkhir.toFraction(), nominal: harta * ibuAkhir.valueOf() },
          { jenis: "anakP", jumlah: nAnak, pecahan: anakAkhir.toFraction(), nominal: harta * anakAkhir.valueOf() },
        ],
        pembahasan: [
          `Ibu 1/6; ${nAnak} anak perempuan ${anakAwal.toFraction()}.`,
          `Total awal = ${totalAwal.toFraction()}, sisa = ${new Fraction(1).sub(totalAwal).toFraction()}.`,
          "Tidak ada ashabah → radd (selain suami/istri).",
          `Hasil: ibu ${ibuAkhir.toFraction()}, anak perempuan ${anakAkhir.toFraction()} (total).`,
        ],
      };
    },
  },
  {
    kode: "T5",
    judul: () => "Suami, ibu, 2 saudara pr kandung (aul 6→8)",
    kategori: ["aul"],
    buatAhliWaris: () => [
      { jenis: "suami", jumlah: 1 },
      { jenis: "saudaraPK", jumlah: 2 },
      { jenis: "ibu", jumlah: 1 },
    ],
    hitung: (harta) => ({
      asalMasalah: 8,
      status: "aul",
      bagian: [
        { jenis: "suami", jumlah: 1, pecahan: "3/8", nominal: harta * 3 / 8 },
        { jenis: "saudaraPK", jumlah: 2, pecahan: "4/8", nominal: harta * 4 / 8 },
        { jenis: "ibu", jumlah: 1, pecahan: "1/8", nominal: harta * 1 / 8 },
      ],
      pembahasan: [
        "Suami 1/2; 2 saudara pr kandung 2/3; ibu 1/6 (ada 2+ saudara).",
        "Asal masalah = 6. Saham 3+4+1 = 8 > 6 → AUL ke 8.",
        "Bagian proporsional terhadap 8: suami 3/8, saudara 4/8, ibu 1/8.",
      ],
    }),
  },
  {
    kode: "T6",
    judul: () => "Istri, ibu, dan ayah",
    kategori: ["ashabul-furud", "ashabah"],
    buatAhliWaris: () => [
      { jenis: "istri", jumlah: 1 },
      { jenis: "ibu", jumlah: 1 },
      { jenis: "ayah", jumlah: 1 },
    ],
    hitung: (harta) => {
      const sisa = new Fraction(1).sub(new Fraction(1, 4)).sub(new Fraction(1, 3)); // 5/12
      return {
        asalMasalah: 12,
        status: "normal",
        bagian: [
          { jenis: "istri", jumlah: 1, pecahan: "1/4", nominal: harta / 4 },
          { jenis: "ibu", jumlah: 1, pecahan: "1/3", nominal: harta / 3 },
          { jenis: "ayah", jumlah: 1, pecahan: sisa.toFraction(), nominal: harta * sisa.valueOf() },
        ],
        pembahasan: [
          "Istri 1/4 (tanpa far'u waris); ibu 1/3 (tanpa far'u & tanpa 2+ saudara).",
          `Ayah ashabah, sisa = ${sisa.toFraction()}.`,
        ],
      };
    },
  },
];

function pilihTemplate(kode) {
  if (kode) {
    const t = TEMPLATES.find((x) => x.kode === kode);
    if (!t) throw new Error(`Template ${kode} tidak ditemukan`);
    return t;
  }
  return TEMPLATES[randInt(0, TEMPLATES.length - 1)];
}

let counter = 0;

function generateSoal(opts = {}) {
  const template = pilihTemplate(opts.templateKode);

  const hartaMin = opts.hartaMin ?? 12_000_000;
  const hartaMax = opts.hartaMax ?? 500_000_000;
  const kelipatan = 12_000_000;
  const harta =
    Math.floor(randInt(hartaMin, hartaMax) / kelipatan) * kelipatan || kelipatan;

  const ahliWaris = template.buatAhliWaris();
  const hasil = template.hitung(harta, ahliWaris);

  counter++;
  return {
    id: `GEN-${String(counter).padStart(4, "0")}`,
    judul: template.judul(),
    kategori: template.kategori,
    kasus: { harta, ahliWaris },
    pertanyaan: "Hitung bagian masing-masing ahli waris.",
    jawaban: {
      asalMasalah: hasil.asalMasalah,
      status: hasil.status,
      bagian: hasil.bagian,
    },
    pembahasan: hasil.pembahasan,
  };
}

function generateBatch(n, opts = {}) {
  return Array.from({ length: n }, () => generateSoal(opts));
}
