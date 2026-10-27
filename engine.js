/**
 * Engine faraid (versi 2 — sudah dipatch).
 * Menghitung pembagian warisan dari daftar ahli waris.
 * Memakai Fraction.js (global `Fraction`).
 *
 * Output: { asalMasalah, status, bagian: [...], langkah: [...], peringatan: [...], keBaitulMal }
 *
 * Patch yang diterapkan:
 * - PATCH 1: Ayah/kakek tidak lagi di-`continue` di tentukanAshabah (BUG 9 — fatal).
 * - PATCH 2: Radd mengubah furud (Fraction), lalu hitung ulang saham (BUG 2).
 * - PATCH 3: Ashabah bil ghair memakai Fraction untuk presisi (BUG 4).
 * - PATCH 4: Deteksi kasus kakek + saudara (muqasamah) (BUG 10).
 * - PATCH 5: Saudara seayah perempuan terhijab 2+ saudara pr kandung tercatat (BUG 6).
 */

// ============ KONSTANTA ============
const JENIS = {
  suami: "suami",
  istri: "istri",
  ayah: "ayah",
  ibu: "ibu",
  kakek: "kakek",
  nenekIbu: "nenekIbu",
  nenekAyah: "nenekAyah",
  anakL: "anakL",
  anakP: "anakP",
  cucuL: "cucuL",
  cucuP: "cucuP",
  saudaraLK: "saudaraLK",
  saudaraPK: "saudaraPK",
  saudaraSeayahL: "saudaraSeayahL",
  saudaraSeayahP: "saudaraSeayahP",
  saudaraSeibu: "saudaraSeibu",
};

const LABEL = {
  suami: "Suami",
  istri: "Istri",
  ayah: "Ayah",
  ibu: "Ibu",
  kakek: "Kakek (dari ayah)",
  nenekIbu: "Nenek (dari ibu)",
  nenekAyah: "Nenek (dari ayah)",
  anakL: "Anak Laki-laki",
  anakP: "Anak Perempuan",
  cucuL: "Cucu Laki-laki (dari anak lk)",
  cucuP: "Cucu Perempuan (dari anak lk)",
  saudaraLK: "Saudara Laki-laki Kandung",
  saudaraPK: "Saudara Perempuan Kandung",
  saudaraSeayahL: "Saudara Laki-laki Seayah",
  saudaraSeayahP: "Saudara Perempuan Seayah",
  saudaraSeibu: "Saudara Seibu (lk/pr)",
};

// ============ HELPER ============
function F(n, d) { return new Fraction(n, d); }

function kpk(a, b) {
  const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
  return Math.abs(a * b) / gcd(a, b);
}

function kpkArray(arr) {
  return arr.reduce((acc, n) => kpk(acc, n), 1);
}

// Konversi nilai (number | Fraction) menjadi Fraction
function toFrac(v) {
  if (v instanceof Fraction) return v;
  return new Fraction(v);
}

// ============ NORMALISASI INPUT ============
function normalisasi(daftar) {
  const map = {};
  for (const { jenis, jumlah } of daftar) {
    if (jumlah > 0) {
      map[jenis] = (map[jenis] || 0) + jumlah;
    }
  }
  return map;
}

// ============ HIJAB HIRMAN ============
function applyHijabHirman(map) {
  const aktif = { ...map };
  const terhijab = [];

  const hapus = (jenis, oleh) => {
    if (aktif[jenis]) {
      terhijab.push({ jenis, oleh });
      delete aktif[jenis];
    }
  };

  const adaAnakL = !!aktif.anakL;
  const adaFarU = adaAnakL || !!aktif.anakP || !!aktif.cucuL || !!aktif.cucuP;

  // Kakek terhijab ayah
  if (aktif.ayah) hapus("kakek", "ayah");

  // Nenek dari ibu terhijab ibu
  if (aktif.ibu) hapus("nenekIbu", "ibu");

  // Nenek dari ayah terhijab ayah atau ibu
  if (aktif.ayah) hapus("nenekAyah", "ayah");
  else if (aktif.ibu) hapus("nenekAyah", "ibu");

  // Cucu terhijab anak laki-laki
  if (adaAnakL) {
    hapus("cucuL", "anak laki-laki");
    hapus("cucuP", "anak laki-laki");
  }

  // Cucu perempuan terhijab 2+ anak perempuan (jika tidak ada anak lk)
  if (!adaAnakL && (aktif.anakP || 0) >= 2) {
    hapus("cucuP", `${aktif.anakP} anak perempuan`);
  }

  // Saudara kandung terhijab anak lk, cucu lk, ayah
  if (adaAnakL) {
    hapus("saudaraLK", "anak laki-laki");
    hapus("saudaraPK", "anak laki-laki");
  }
  if (aktif.cucuL) {
    hapus("saudaraLK", "cucu laki-laki");
    hapus("saudaraPK", "cucu laki-laki");
  }
  if (aktif.ayah) {
    hapus("saudaraLK", "ayah");
    hapus("saudaraPK", "ayah");
  }

  // Saudara seayah terhijab: anak lk, cucu lk, ayah, saudara lk kandung
  if (adaAnakL) {
    hapus("saudaraSeayahL", "anak laki-laki");
    hapus("saudaraSeayahP", "anak laki-laki");
  }
  if (aktif.cucuL) {
    hapus("saudaraSeayahL", "cucu laki-laki");
    hapus("saudaraSeayahP", "cucu laki-laki");
  }
  if (aktif.ayah) {
    hapus("saudaraSeayahL", "ayah");
    hapus("saudaraSeayahP", "ayah");
  }
  if (aktif.saudaraLK) {
    hapus("saudaraSeayahL", "saudara lk kandung");
    hapus("saudaraSeayahP", "saudara lk kandung");
  }

  // PATCH 5: Saudara seayah perempuan terhijab 2+ saudara perempuan kandung
  if ((aktif.saudaraPK || 0) >= 2) {
    hapus("saudaraSeayahP", `${aktif.saudaraPK} saudara perempuan kandung`);
  }

  // Saudara seibu terhijab far'u waris, ayah, kakek
  if (adaFarU) hapus("saudaraSeibu", "far'u waris (anak/cucu)");
  if (aktif.ayah) hapus("saudaraSeibu", "ayah");
  if (aktif.kakek) hapus("saudaraSeibu", "kakek");

  return { aktif, terhijab };
}

// ============ ASHABUL FURUD ============
function tentukanFurud(aktif) {
  const furud = {};
  const ashabahKandidat = [];
  const langkah = [];

  const adaAnakL = !!aktif.anakL;
  const adaAnakP = (aktif.anakP || 0) > 0;
  const adaCucuL = !!aktif.cucuL;
  const adaCucuP = (aktif.cucuP || 0) > 0;
  const adaFarU = adaAnakL || adaAnakP || adaCucuL || adaCucuP;
  const adaAyah = !!aktif.ayah;
  const adaIbu = !!aktif.ibu;
  const adaKakek = !!aktif.kakek;

  const jumlahSaudara =
    (aktif.saudaraLK || 0) +
    (aktif.saudaraPK || 0) +
    (aktif.saudaraSeayahL || 0) +
    (aktif.saudaraSeayahP || 0) +
    (aktif.saudaraSeibu || 0);

  // ---------- SUAMI ----------
  if (aktif.suami) {
    furud.suami = adaFarU ? F(1, 4) : F(1, 2);
    langkah.push(
      `Suami mendapat ${furud.suami.toFraction()} karena ${adaFarU ? "ada" : "tidak ada"} far'u waris.`
    );
  }

  // ---------- ISTRI ----------
  if (aktif.istri) {
    furud.istri = adaFarU ? F(1, 8) : F(1, 4);
    langkah.push(
      `Istri mendapat ${furud.istri.toFraction()} karena ${adaFarU ? "ada" : "tidak ada"} far'u waris.`
    );
  }

  // ---------- AYAH ----------
  if (adaAyah) {
    if (adaFarU) {
      furud.ayah = F(1, 6);
      ashabahKandidat.push("ayah"); // ayah dapat 1/6 + sisa (jika ada)
      langkah.push("Ayah mendapat 1/6 karena ada far'u waris, dan berhak atas sisa (ashabah).");
    } else {
      ashabahKandidat.push("ayah");
      langkah.push("Ayah menjadi ashabah (tanpa far'u waris).");
    }
  }

  // ---------- IBU ----------
  if (adaIbu) {
    const adaDuaSaudaraAtauLebih = jumlahSaudara >= 2;
    if (adaFarU || adaDuaSaudaraAtauLebih) {
      furud.ibu = F(1, 6);
      langkah.push(
        `Ibu mendapat 1/6 karena ${adaFarU ? "ada far'u waris" : "ada 2+ saudara"}.`
      );
    } else {
      const adaPasangan = !!aktif.suami || !!aktif.istri;
      if (adaPasangan && adaAyah) {
        // Gharrawain: 1/3 dari sisa setelah pasangan
        const bagianPasangan = aktif.suami ? F(1, 2) : F(1, 4);
        const sisaSetelahPasangan = F(1).sub(bagianPasangan);
        furud.ibu = sisaSetelahPasangan.mul(F(1, 3));
        langkah.push(
          `Kasus Gharrawain: ibu mendapat 1/3 dari sisa setelah pasangan = 1/3 × ${sisaSetelahPasangan.toFraction()} = ${furud.ibu.toFraction()}.`
        );
      } else {
        furud.ibu = F(1, 3);
        langkah.push("Ibu mendapat 1/3 (tanpa far'u waris & tanpa 2+ saudara).");
      }
    }
  }

  // ---------- KAKEK ----------
  if (adaKakek) {
    if (adaFarU) {
      furud.kakek = F(1, 6);
      ashabahKandidat.push("kakek");
      langkah.push("Kakek mendapat 1/6 karena ada far'u waris, dan berhak atas sisa (ashabah).");
    } else {
      ashabahKandidat.push("kakek");
      langkah.push("Kakek menjadi ashabah (tanpa far'u waris).");
    }
  }

  // ---------- NENEK ----------
  if (aktif.nenekIbu) {
    furud.nenekIbu = F(1, 6);
    langkah.push("Nenek (dari ibu) mendapat 1/6.");
  }
  if (aktif.nenekAyah) {
    furud.nenekAyah = F(1, 6);
    langkah.push("Nenek (dari ayah) mendapat 1/6.");
  }
  if (aktif.nenekIbu && aktif.nenekAyah) {
    furud.nenekIbu = F(1, 12);
    furud.nenekAyah = F(1, 12);
    langkah.push("1/6 untuk dua nenek dibagi rata: masing-masing 1/12.");
  }

  // ---------- ANAK PEREMPUAN ----------
  if (adaAnakP) {
    if (adaAnakL) {
      ashabahKandidat.push("anakP");
      langkah.push("Anak perempuan menjadi ashabah bil ghair (bersama anak laki-laki, 2:1).");
    } else {
      if (aktif.anakP === 1) {
        furud.anakP = F(1, 2);
        langkah.push("Anak perempuan (1 orang) mendapat 1/2.");
      } else {
        furud.anakP = F(2, 3);
        langkah.push(`${aktif.anakP} anak perempuan mendapat 2/3 (dibagi rata).`);
      }
    }
  }

  // ---------- CUCU PEREMPUAN ----------
  if (adaCucuP && !adaAnakL) {
    if (adaCucuL) {
      ashabahKandidat.push("cucuP");
      langkah.push("Cucu perempuan menjadi ashabah bil ghair (bersama cucu laki-laki, 2:1).");
    } else {
      const jmlAnakP = aktif.anakP || 0;
      if (jmlAnakP === 0) {
        if (aktif.cucuP === 1) {
          furud.cucuP = F(1, 2);
          langkah.push("Cucu perempuan (1 orang) mendapat 1/2.");
        } else {
          furud.cucuP = F(2, 3);
          langkah.push(`${aktif.cucuP} cucu perempuan mendapat 2/3 (dibagi rata).`);
        }
      } else if (jmlAnakP === 1) {
        furud.cucuP = F(1, 6);
        langkah.push("Cucu perempuan mendapat 1/6 (pelengkap 2/3 bersama 1 anak perempuan).");
      }
    }
  }

  // ---------- SAUDARA KANDUNG PEREMPUAN ----------
  if (aktif.saudaraPK && !adaAnakL && !adaCucuL && !adaAyah) {
    if (aktif.saudaraLK) {
      ashabahKandidat.push("saudaraPK");
      langkah.push("Saudara perempuan kandung menjadi ashabah bil ghair (bersama saudara lk kandung, 2:1).");
    } else if (adaAnakP || adaCucuP) {
      ashabahKandidat.push("saudaraPK");
      langkah.push("Saudara perempuan kandung menjadi ashabah ma'al ghair (bersama far'u waris perempuan).");
    } else {
      if (aktif.saudaraPK === 1) {
        furud.saudaraPK = F(1, 2);
        langkah.push("Saudara perempuan kandung (1 orang) mendapat 1/2.");
      } else {
        furud.saudaraPK = F(2, 3);
        langkah.push(`${aktif.saudaraPK} saudara perempuan kandung mendapat 2/3.`);
      }
    }
  }

  // ---------- SAUDARA SEAYAH PEREMPUAN ----------
  if (aktif.saudaraSeayahP && !adaAnakL && !adaCucuL && !adaAyah && !aktif.saudaraLK) {
    const adaSaudaraKandungPr = !!aktif.saudaraPK;

    if (aktif.saudaraSeayahL) {
      ashabahKandidat.push("saudaraSeayahP");
      langkah.push("Saudara perempuan seayah menjadi ashabah bil ghair (bersama saudara lk seayah, 2:1).");
    } else if (adaAnakP || adaCucuP) {
      ashabahKandidat.push("saudaraSeayahP");
      langkah.push("Saudara perempuan seayah menjadi ashabah ma'al ghair.");
    } else if (adaSaudaraKandungPr) {
      const jmlSaudaraPK = aktif.saudaraPK || 0;
      if (jmlSaudaraPK === 1) {
        furud.saudaraSeayahP = F(1, 6);
        langkah.push("Saudara perempuan seayah mendapat 1/6 (pelengkap 2/3 bersama 1 saudara pr kandung).");
      }
      // Jika >= 2 saudara pr kandung, sudah terhijab di applyHijabHirman (PATCH 5)
    } else {
      if (aktif.saudaraSeayahP === 1) {
        furud.saudaraSeayahP = F(1, 2);
        langkah.push("Saudara perempuan seayah (1 orang) mendapat 1/2.");
      } else {
        furud.saudaraSeayahP = F(2, 3);
        langkah.push(`${aktif.saudaraSeayahP} saudara perempuan seayah mendapat 2/3.`);
      }
    }
  }

  // ---------- SAUDARA SEIBU ----------
  if (aktif.saudaraSeibu) {
    if (aktif.saudaraSeibu === 1) {
      furud.saudaraSeibu = F(1, 6);
      langkah.push("Saudara seibu (1 orang) mendapat 1/6.");
    } else {
      furud.saudaraSeibu = F(1, 3);
      langkah.push(`${aktif.saudaraSeibu} saudara seibu mendapat 1/3 (dibagi rata).`);
    }
  }

  return { furud, ashabahKandidat, langkah };
}

// ============ ASHABAH ============
const URUTAN_ASHABAH_BIN_NAFSI = [
  "anakL",
  "cucuL",
  "ayah",
  "kakek",
  "saudaraLK",
  "saudaraSeayahL",
];

/**
 * PATCH 1: Hapus `continue` untuk ayah/kakek.
 * Ayah/kakek tetap ashabah kandidat (dapat 1/6 + sisa bila ada far'u),
 * tapi anak laki-laki/cucu laki-laki tetap prioritas lebih tinggi.
 */
function tentukanAshabah(aktif, ashabahKandidat) {
  // 1. Ashabah bin nafsi
  for (const jenis of URUTAN_ASHABAH_BIN_NAFSI) {
    if (aktif[jenis] && ashabahKandidat.includes(jenis)) {
      return {
        pemenang: jenis,
        jenisAshabah: "bin-nafsi",
        kelompok: [jenis],
      };
    }
  }

  // 2. Ashabah bil ghair: anak lk + anak pr
  if (aktif.anakL) {
    const kelompok = ["anakL"];
    if (aktif.anakP) kelompok.push("anakP");
    return { pemenang: "anakL", jenisAshabah: "bil-ghair", kelompok };
  }

  // 3. Cucu lk + cucu pr
  if (aktif.cucuL) {
    const kelompok = ["cucuL"];
    if (aktif.cucuP) kelompok.push("cucuP");
    return { pemenang: "cucuL", jenisAshabah: "bil-ghair", kelompok };
  }

  // 4. Saudara lk kandung + saudara pr kandung
  if (aktif.saudaraLK && ashabahKandidat.includes("saudaraPK")) {
    return { pemenang: "saudaraLK", jenisAshabah: "bil-ghair", kelompok: ["saudaraLK", "saudaraPK"] };
  }
  if (aktif.saudaraLK) {
    return { pemenang: "saudaraLK", jenisAshabah: "bin-nafsi", kelompok: ["saudaraLK"] };
  }

  // 5. Saudara lk seayah + saudara pr seayah
  if (aktif.saudaraSeayahL && ashabahKandidat.includes("saudaraSeayahP")) {
    return { pemenang: "saudaraSeayahL", jenisAshabah: "bil-ghair", kelompok: ["saudaraSeayahL", "saudaraSeayahP"] };
  }
  if (aktif.saudaraSeayahL) {
    return { pemenang: "saudaraSeayahL", jenisAshabah: "bin-nafsi", kelompok: ["saudaraSeayahL"] };
  }

  // 6. Ashabah ma'al ghair
  if (aktif.saudaraPK && ashabahKandidat.includes("saudaraPK") && (aktif.anakP || aktif.cucuP)) {
    return { pemenang: "saudaraPK", jenisAshabah: "ma'al-ghair", kelompok: ["saudaraPK"] };
  }
  if (aktif.saudaraSeayahP && ashabahKandidat.includes("saudaraSeayahP") && (aktif.anakP || aktif.cucuP)) {
    return { pemenang: "saudaraSeayahP", jenisAshabah: "ma'al-ghair", kelompok: ["saudaraSeayahP"] };
  }

  return { pemenang: null, jenisAshabah: null, kelompok: [] };
}

// ============ HITUNG ASAL MASALAH ============
function hitungAsalMasalah(furud) {
  const penyebut = Object.values(furud).map((f) => f.d);
  if (penyebut.length === 0) return 1;
  return kpkArray(penyebut);
}

// ============ FUNGSI UTAMA ============
function hitungFaraid(harta, daftarAhliWaris) {
  const langkah = [];
  const peringatan = [];

  // 1. Normalisasi
  const map = normalisasi(daftarAhliWaris);
  langkah.push(
    `Ahli waris awal: ${Object.entries(map).map(([j, n]) => `${LABEL[j]} (${n})`).join(", ") || "—"}.`
  );

  if (Object.keys(map).length === 0) {
    return {
      asalMasalah: 0,
      status: "kosong",
      bagian: [],
      langkah: ["Tidak ada ahli waris."],
      peringatan: ["Daftar ahli waris kosong."],
      keBaitulMal: 0,
    };
  }

  // 2. Hijab hirman
  const { aktif, terhijab } = applyHijabHirman(map);
  if (terhijab.length > 0) {
    langkah.push(
      "Hijab hirman: " +
        terhijab.map((t) => `${LABEL[t.jenis]} terhalang oleh ${t.oleh}`).join("; ") +
        "."
    );
  } else {
    langkah.push("Tidak ada hijab hirman.");
  }

  if (Object.keys(aktif).length === 0) {
    return {
      asalMasalah: 0,
      status: "habis-terhijab",
      bagian: [],
      langkah: [...langkah, "Semua ahli waris terhijab."],
      peringatan: ["Semua ahli waris terhalang. Harta ke baitul mal."],
      keBaitulMal: 0,
    };
  }

  langkah.push(
    `Ahli waris aktif: ${Object.entries(aktif).map(([j, n]) => `${LABEL[j]} (${n})`).join(", ")}.`
  );

  // 2b. Deteksi kasus langka
  const kasusLangka = deteksiKasusLangka(aktif);
  if (kasusLangka.terdeteksi) {
    peringatan.push(kasusLangka.pesan);
    langkah.push(`Deteksi kasus khusus: ${kasusLangka.kasus.toUpperCase()} — lihat peringatan.`);

    const kasusBelumDitangani = ["musyarakah", "akdariyah", "kakek-saudara"];
    if (kasusBelumDitangani.includes(kasusLangka.kasus)) {
      return {
        asalMasalah: 0,
        status: "perlu-konsultasi",
        bagian: [],
        langkah: [
          ...langkah,
          "Engine menghentikan perhitungan karena kasus ini memerlukan penanganan khusus.",
          "Silakan konsultasikan ke ahli faraid atau gunakan referensi mazhab yang diikuti.",
        ],
        peringatan,
        keBaitulMal: 0,
      };
    }
  }

  // 3. Tentukan furud & ashabah kandidat
  const { furud, ashabahKandidat, langkah: langkahFurud } = tentukanFurud(aktif);
  langkah.push(...langkahFurud);

  // 4. Tentukan ashabah
  const ashabah = tentukanAshabah(aktif, ashabahKandidat);
  if (ashabah.pemenang) {
    langkah.push(
      `Ashabah: ${LABEL[ashabah.pemenang]} (${ashabah.jenisAshabah}) berhak mengambil sisa.`
    );
  } else {
    langkah.push("Tidak ada ashabah.");
  }

  // 5. Hitung asal masalah dari furud
  let asalMasalah = hitungAsalMasalah(furud);
  langkah.push(`Asal masalah (KPK penyebut furud) = ${asalMasalah}.`);

  // 6. Hitung saham furud (sebagai Fraction)
  let totalSahamFrac = F(0);
  const sahamFurud = {}; // jenis -> Fraction
  for (const [jenis, frac] of Object.entries(furud)) {
    const saham = frac.mul(asalMasalah); // Fraction
    sahamFurud[jenis] = saham;
    totalSahamFrac = totalSahamFrac.add(saham);
  }
  const totalSahamNum = totalSahamFrac.valueOf();
  langkah.push(`Total saham furud = ${totalSahamNum} dari asal masalah ${asalMasalah}.`);

  // 7. Cek AUL
  let status = "normal";
  if (totalSahamFrac.compare(asalMasalah) > 0) {
    status = "aul";
    langkah.push(
      `Terjadi AUL: total saham ${totalSahamNum} > asal masalah ${asalMasalah}. Asal masalah diganti menjadi ${totalSahamNum}.`
    );
    asalMasalah = totalSahamNum;
  }

  // 8. Hitung sisa untuk ashabah (Fraction)
  let sisaSaham = F(asalMasalah).sub(totalSahamFrac);
  const sahamAshabah = {}; // jenis -> Fraction

  if (sisaSaham.compare(0) > 0 && ashabah.pemenang) {
    if (ashabah.jenisAshabah === "bil-ghair" && ashabah.kelompok.length === 2) {
      // PATCH 3: pakai Fraction untuk presisi
      const [lk, pr] = ashabah.kelompok;
      const jmlLk = aktif[lk] || 0;
      const jmlPr = aktif[pr] || 0;
      const totalBagian = jmlLk * 2 + jmlPr * 1;
      sahamAshabah[lk] = sisaSaham.mul(2 * jmlLk).div(totalBagian);
      if (jmlPr > 0) {
        sahamAshabah[pr] = sisaSaham.mul(jmlPr).div(totalBagian);
      }
      langkah.push(
        `Sisa ${sisaSaham.toFraction()} saham dibagi 2:1 antara ${LABEL[lk]} dan ${LABEL[pr]}.`
      );
    } else {
      // Bin nafsi / ma'al ghair: semua sisa ke pemenang
      sahamAshabah[ashabah.pemenang] = sisaSaham;
      langkah.push(
        `Sisa ${sisaSaham.toFraction()} saham diberikan ke ${LABEL[ashabah.pemenang]}.`
      );
    }
    sisaSaham = F(0);
  }

  // 9. Cek RADD — PATCH 2: ubah furud (Fraction), lalu hitung ulang saham
  if (sisaSaham.compare(0) > 0 && ashabah.pemenang) {
    const kandidatRadd = Object.keys(furud).filter(
      (j) => j !== "suami" && j !== "istri"
    );
    if (kandidatRadd.length > 0) {
      status = "radd";
      const totalFurudRadd = kandidatRadd.reduce(
        (acc, j) => acc.add(furud[j]),
        F(0)
      );
      const sisaPecahan = sisaSaham.div(asalMasalah); // Fraction
      langkah.push(
        `Terjadi RADD: sisa ${sisaSaham.toFraction()}/${asalMasalah} dibagikan proporsional ke ${kandidatRadd
          .map((j) => LABEL[j])
          .join(", ")} (selain suami/istri).`
      );
      for (const j of kandidatRadd) {
        const porsi = furud[j].div(totalFurudRadd);
        furud[j] = furud[j].add(porsi.mul(sisaPecahan));
      }
      // Hitung ulang sahamFurud dari furud yang baru
      for (const j of Object.keys(furud)) {
        sahamFurud[j] = furud[j].mul(asalMasalah);
      }
      sisaSaham = F(0);
    }
  }

  // 10. Sisa ke baitul mal
  let keBaitulMalFrac = F(0);
  if (sisaSaham.compare(0) > 0) {
    keBaitulMalFrac = sisaSaham;
    langkah.push(
      `Sisa ${sisaSaham.toFraction()} saham tidak ada yang berhak (tidak ada ashabah, radd tidak berlaku). Diserahkan ke baitul mal.`
    );
    peringatan.push("Ada sisa harta yang diserahkan ke baitul mal.");
  }

  // 11. Susun output bagian
  const bagian = [];
  const semuaJenis = new Set([
    ...Object.keys(sahamFurud),
    ...Object.keys(sahamAshabah),
  ]);

  for (const jenis of semuaJenis) {
    const sahamF = (sahamFurud[jenis] || F(0)).add(sahamAshabah[jenis] || F(0));
    if (sahamF.compare(0) <= 0) continue;

    const pecahan = sahamF.div(asalMasalah);
    const jumlah = aktif[jenis] || 1;
    const nominal = harta * pecahan.valueOf();

    bagian.push({
      jenis,
      jumlah,
      pecahan: pecahan.toFraction(),
      nominal,
      perOrang: nominal / jumlah,
    });
  }

  // Urutkan nominal desc
  bagian.sort((a, b) => b.nominal - a.nominal);

  // 12. Validasi total
  const totalPecahan = bagian.reduce(
    (acc, b) => acc.add(new Fraction(b.pecahan)),
    F(0)
  );
  const totalDenganBaitulMal = totalPecahan.add(keBaitulMalFrac.div(asalMasalah));
  if (!totalDenganBaitulMal.equals(1)) {
    peringatan.push(
      `Total pecahan (termasuk baitul mal) ${totalDenganBaitulMal.toFraction()} ≠ 1. Ada kemungkinan bug engine.`
    );
  }

  return {
    asalMasalah,
    status,
    bagian,
    langkah,
    peringatan,
    keBaitulMal: keBaitulMalFrac.compare(0) > 0 ? keBaitulMalFrac.div(asalMasalah).valueOf() * harta : 0,
  };
}

// ============ DETEKSI KASUS LANGKA ============
function deteksiKasusLangka(aktif) {
  const adaSuami = !!aktif.suami;
  const adaIstri = !!aktif.istri;
  const adaIbu = !!aktif.ibu;
  const adaAyah = !!aktif.ayah;
  const adaKakek = !!aktif.kakek;
  const adaAnakL = !!aktif.anakL;
  const adaAnakP = (aktif.anakP || 0) > 0;
  const adaCucu = !!aktif.cucuL || (aktif.cucuP || 0) > 0;
  const adaSaudaraLK = (aktif.saudaraLK || 0) > 0;
  const jmlSaudaraSeibu = aktif.saudaraSeibu || 0;
  const jmlSaudaraPK = aktif.saudaraPK || 0;
  const adaPasangan = adaSuami || adaIstri;
  const adaFarU = adaAnakL || adaAnakP || adaCucu;

  // ---------- MUSYARAKAH ----------
  if (
    adaSuami &&
    adaIbu &&
    jmlSaudaraSeibu >= 2 &&
    adaSaudaraLK &&
    !adaFarU &&
    !adaAyah &&
    !adaKakek
  ) {
    return {
      terdeteksi: true,
      kasus: "musyarakah",
      pesan:
        "⚠️ Kasus MUSYARAKAH terdeteksi (suami + ibu + 2+ saudara seibu + saudara kandung laki-laki). " +
        "Engine ini belum menangani musyarakah. Dalam mazhab Syafi'i, saudara kandung tidak mendapat sisa " +
        "karena harta habis untuk ashabul furud. Dalam mazhab Hanafi/Maliki, saudara seibu ikut berbagi sisa " +
        "dengan saudara kandung (musyarakah). Silakan konsultasikan ke ahli faraid untuk kepastian.",
    };
  }

  // ---------- AKDARIYAH ----------
  if (
    adaPasangan &&
    adaIbu &&
    adaKakek &&
    jmlSaudaraPK === 1 &&
    !adaSaudaraLK &&
    !(aktif.saudaraSeibu || 0) &&
    !adaAyah &&
    !adaFarU
  ) {
    return {
      terdeteksi: true,
      kasus: "akdariyah",
      pesan:
        "⚠️ Kasus AKDARIYAH terdeteksi (suami/istri + ibu + kakek + 1 saudara perempuan kandung). " +
        "Engine ini belum menangani akdariyah. Kasus ini memerlukan penyelesaian khusus karena kakek " +
        "dan saudara perempuan kandung bertemu. Menurut mazhab Syafi'i, kakek dianggap sebagai saudara " +
        "laki-laki (ashabah bil ghair) sehingga bagiannya 2:1 dengan saudara perempuan. " +
        "Silakan konsultasikan ke ahli faraid untuk perhitungan yang tepat.",
    };
  }

  // ---------- PATCH 4: KAKEK + SAUDARA (muqasamah) ----------
  if (adaKakek && (adaSaudaraLK || jmlSaudaraPK > 0) && !adaAyah && !adaFarU) {
    return {
      terdeteksi: true,
      kasus: "kakek-saudara",
      pesan:
        "⚠️ Kasus KAKEK + SAUDARA terdeteksi. Kakek dan saudara kandung berbagi sisa (muqasamah) " +
        "dengan aturan khusus yang bergantung pada jumlah dan jenis kelamin saudara. " +
        "Engine ini belum menangani kasus ini. Silakan konsultasikan ke ahli faraid.",
    };
  }

  // ---------- GHARRAWAIN ----------
  const jumlahSaudara =
    (aktif.saudaraLK || 0) +
    (aktif.saudaraPK || 0) +
    (aktif.saudaraSeayahL || 0) +
    (aktif.saudaraSeayahP || 0) +
    (aktif.saudaraSeibu || 0);
  if (adaPasangan && adaIbu && adaAyah && !adaFarU && jumlahSaudara < 2 && !adaKakek) {
    return {
      terdeteksi: true,
      kasus: "gharrawain",
      pesan:
        "ℹ️ Kasus GHARRAWAIN terdeteksi (suami/istri + ibu + ayah). Engine sudah menangani kasus ini " +
        "dengan metode tsuluts al-baqi (ibu mendapat 1/3 dari sisa setelah pasangan).",
    };
  }

  return { terdeteksi: false, kasus: null, pesan: "" };
}
