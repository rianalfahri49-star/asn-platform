import Link from "next/link";
import { ArrowRight, BookOpen, BrainCircuit, CheckCircle2, Clock3, GraduationCap, Menu, ShieldCheck, Sparkles, Target, Trophy, Users, Zap } from "lucide-react";

const programs = [
  { tag: "CPNS", title: "Persiapan CPNS", description: "Latihan SKD dengan materi TWK, TIU, dan TKP yang tersusun rapi.", icon: GraduationCap, tone: "blue", items: ["Materi dan rangkuman", "Latihan per subtes", "Simulasi CAT"] },
  { tag: "PPPK", title: "Persiapan PPPK", description: "Belajar kompetensi sesuai bidang dan kebutuhan seleksi PPPK.", icon: BookOpen, tone: "violet", items: ["Kompetensi teknis", "Kompetensi manajerial", "Kompetensi sosial kultural"] },
  { tag: "LATIHAN", title: "Simulasi CAT", description: "Biasakan diri dengan latihan berbatas waktu dan evaluasi hasil.", icon: BrainCircuit, tone: "cyan", items: ["Tampilan latihan terstruktur", "Hitung mundur waktu", "Evaluasi setelah selesai"] },
];

const features = [
  { icon: Target, title: "Belajar lebih terarah", text: "Susun proses belajar berdasarkan kategori dan topik yang ingin dikuasai." },
  { icon: Clock3, title: "Latihan dengan waktu", text: "Bangun kebiasaan mengerjakan soal dengan manajemen waktu." },
  { icon: Trophy, title: "Pantau perkembangan", text: "Evaluasi hasil latihan untuk mengetahui bagian yang perlu ditingkatkan." },
  { icon: ShieldCheck, title: "Akses yang aman", text: "Pengembangan akun dan data pengguna dirancang dengan perhatian pada keamanan." },
];

export default function Home() {
  return (
    <main className="overflow-hidden">
      <header className="relative z-10 border-b border-blue-100/80 bg-white/90 backdrop-blur">
        <div className="container flex h-[76px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3" aria-label="LolosCPNS beranda">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20"><GraduationCap size={23} /></span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">Lolos<span className="text-blue-600">CPNS</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 md:flex">
            <a href="#program" className="transition hover:text-blue-600">Program</a>
            <a href="#fitur" className="transition hover:text-blue-600">Fitur</a>
            <a href="#tentang" className="transition hover:text-blue-600">Tentang</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="#program" className="hidden rounded-xl px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50 sm:inline-flex">Jelajahi</Link>
            <Link href="#program" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Mulai belajar <ArrowRight size={16} /></Link>
          </div>
        </div>
      </header>

      <section className="hero-glow grid-pattern relative">
        <div className="container grid min-h-[620px] items-center gap-12 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3.5 py-2 text-xs font-bold text-blue-700 shadow-sm"><Sparkles size={14} /> Teman belajar persiapan seleksi ASN</div>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-slate-950 sm:text-5xl lg:text-[60px]">Persiapan ASN lebih <span className="text-blue-600">terarah</span>, mulai dari sini.</h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">Belajar materi, berlatih soal, dan evaluasi kemampuan dalam satu platform untuk membantu persiapan CPNS dan PPPK.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#program" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">Lihat program belajar <ArrowRight size={17} /></Link>
              <Link href="#fitur" className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50">Kenali fitur</Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-500" /> Belajar fleksibel</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 size={17} className="text-emerald-500" /> Tampilan ramah mobile</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[510px]">
            <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-blue-200/70 via-white to-cyan-100/70 blur-2xl" />
            <div className="relative rounded-[2rem] border border-white bg-white p-5 shadow-[0_30px_90px_rgba(30,64,175,.16)] sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div><p className="text-xs font-bold uppercase tracking-[.16em] text-blue-600">Dashboard belajar</p><h2 className="mt-1 text-xl font-extrabold text-slate-900">Siap tingkatkan kemampuan?</h2></div>
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600"><BrainCircuit size={23} /></span>
              </div>
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-5 text-white">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-blue-100">Target latihan</span><Zap size={18} className="text-yellow-300" /></div>
                <p className="mt-3 text-3xl font-black">Konsisten setiap hari</p><p className="mt-2 text-sm leading-6 text-blue-100">Satu langkah kecil hari ini membawa kamu lebih dekat pada target.</p>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-cyan-300" /></div>
                <div className="mt-2 flex justify-between text-xs text-blue-100"><span>Contoh progres belajar</span><span>2 dari 3 sesi</span></div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-100 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-50 text-violet-600"><BookOpen size={18} /></span><p className="mt-3 text-2xl font-black text-slate-900">Materi</p><p className="mt-1 text-xs text-slate-500">Ringkasan pembelajaran</p></div>
                <div className="rounded-2xl border border-slate-100 p-4"><span className="grid h-9 w-9 place-items-center rounded-xl bg-cyan-50 text-cyan-600"><Target size={18} /></span><p className="mt-3 text-2xl font-black text-slate-900">Latihan</p><p className="mt-1 text-xs text-slate-500">Asah kemampuanmu</p></div>
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Trophy size={19} /></span><div><p className="text-sm font-bold text-slate-800">Evaluasi dan berkembang</p><p className="mt-0.5 text-xs text-slate-500">Kenali kekuatan dan materi yang perlu diulang</p></div></div>
            </div>
            <div className="absolute -right-3 top-16 hidden rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-soft sm:block"><div className="flex items-center gap-2 text-sm font-bold text-slate-800"><Users size={17} className="text-blue-600" /> Belajar bersama</div><p className="mt-1 text-xs text-slate-500">Bangun rutinitas persiapan</p></div>
          </div>
        </div>
      </section>

      <section id="program" className="container py-20 sm:py-24">
        <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-600">Program belajar</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Pilih jalur persiapanmu</h2><p className="mt-4 leading-7 text-slate-600">Mulai dari kebutuhan seleksi yang sedang kamu persiapkan. Materi dan fitur akan terus dikembangkan.</p></div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {programs.map((program) => { const Icon = program.icon; return <article key={program.tag} className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft"><div className="flex items-center justify-between"><span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-extrabold tracking-wider text-blue-700">{program.tag}</span><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white"><Icon size={24} /></span></div><h3 className="mt-6 text-xl font-extrabold text-slate-900">{program.title}</h3><p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-600">{program.description}</p><ul className="mt-5 space-y-3">{program.items.map(item => <li key={item} className="flex items-center gap-2 text-sm text-slate-600"><CheckCircle2 size={16} className="shrink-0 text-emerald-500" />{item}</li>)}</ul><Link href="#fitur" className="mt-7 inline-flex items-center gap-2 text-sm font-extrabold text-blue-700">Pelajari fitur <ArrowRight size={16} className="transition group-hover:translate-x-1" /></Link></article>; })}
        </div>
      </section>

      <section id="fitur" className="bg-slate-50 py-20 sm:py-24">
        <div className="container grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-center">
          <div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-600">Kenapa LolosCPNS</p><h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Belajar dengan strategi, bukan sekadar menghafal.</h2><p className="mt-5 leading-7 text-slate-600">Persiapan seleksi membutuhkan latihan yang konsisten. Gunakan platform ini untuk membangun rutinitas belajar dan mengevaluasi kemajuanmu.</p><Link href="#tentang" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700">Tentang platform <ArrowRight size={16} /></Link></div>
          <div className="grid gap-4 sm:grid-cols-2">{features.map(({icon: Icon,title,text}) => <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6"><span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600"><Icon size={21} /></span><h3 className="mt-4 font-extrabold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>)}</div>
        </div>
      </section>

      <section id="tentang" className="container py-20 sm:py-24">
        <div className="rounded-[2rem] bg-gradient-to-br from-blue-700 to-blue-950 px-7 py-12 text-center text-white sm:px-14 sm:py-16"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/15"><Sparkles size={26} /></span><h2 className="mx-auto mt-6 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Mulai persiapanmu hari ini.</h2><p className="mx-auto mt-4 max-w-xl leading-7 text-blue-100">Bangun kebiasaan belajar yang konsisten. Siapkan diri dengan lebih percaya diri, satu sesi latihan dalam satu waktu.</p><Link href="#program" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-50">Jelajahi program <ArrowRight size={17} /></Link></div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="container flex flex-col gap-5 py-8 sm:flex-row sm:items-center sm:justify-between"><Link href="/" className="flex items-center gap-2 font-extrabold text-slate-900"><span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white"><GraduationCap size={18} /></span>Lolos<span className="text-blue-600">CPNS</span></Link><p className="max-w-2xl text-xs leading-5 text-slate-500">LolosCPNS adalah platform belajar independen dan bukan situs resmi pemerintah, BKN, atau instansi penyelenggara seleksi ASN. Informasi seleksi tetap merujuk pada pengumuman resmi instansi terkait.</p><p className="text-xs text-slate-400">© {new Date().getFullYear()} LolosCPNS</p></div>
      </footer>
    </main>
  );
}
