import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Smile, Flame, Moon, Sun, Sparkles, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { A, CATS, CAT_ORDER, GHOSTS, GHOST_ORDER, COLLECTION, EVO_NAMES, BOSS_SKILLS, SNACK_COST } from "../game/data";

const Stat = ({ label, value }) => (
  <div className="rounded-lg bg-black/30 px-2 py-1 text-center">
    <div className="text-[10px] uppercase tracking-wider text-slate-400">{label}</div>
    <div className="font-display text-sm">{value}</div>
  </div>
);

const Entry = ({ testid, img, title, subtitle, desc, stats, accent }) => (
  <div className="panel flex flex-col gap-3 p-4" style={{ borderColor: accent }} data-testid={testid}>
    <div className="flex items-center gap-3">
      <img src={img} alt={title} className="card-sprite-bob h-20 w-20 object-contain" />
      <div>
        <div className="font-display text-lg leading-tight">{title}</div>
        <div className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>{subtitle}</div>
      </div>
    </div>
    <p className="text-sm leading-relaxed text-slate-300">{desc}</p>
    {stats && <div className="mt-auto grid grid-cols-3 gap-2">{stats.map((s) => <Stat key={s[0]} label={s[0]} value={s[1]} />)}</div>}
  </div>
);

const Mechanic = ({ icon: Icon, color, title, children }) => (
  <div className="panel p-5" style={{ borderColor: color }}>
    <div className="mb-2 flex items-center gap-2 font-display text-xl"><Icon size={22} style={{ color }} /> {title}</div>
    <div className="space-y-1 text-sm leading-relaxed text-slate-300">{children}</div>
  </div>
);

export default function Almanac() {
  const navigate = useNavigate();
  return (
    <div className="scroll-page bg-[#0d0a26] px-4 py-5 sm:px-10" data-testid="almanac-page">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center gap-3">
          <button type="button" className="gbtn gbtn-ghost gbtn-icon" onClick={() => navigate("/")} data-testid="btn-back-home" aria-label="Kembali">
            <ArrowLeft size={22} />
          </button>
          <h1 className="font-display text-3xl sm:text-4xl">Buku Kucing & Hantu</h1>
        </div>
        <Tabs defaultValue="cats">
          <TabsList className="mb-5 h-auto flex-wrap gap-1 rounded-2xl bg-indigo-950 p-1.5">
            <TabsTrigger value="cats" className="font-display rounded-xl px-4 py-2" data-testid="tab-cats">Kucing</TabsTrigger>
            <TabsTrigger value="ghosts" className="font-display rounded-xl px-4 py-2" data-testid="tab-ghosts">Hantu</TabsTrigger>
            <TabsTrigger value="collection" className="font-display rounded-xl px-4 py-2" data-testid="tab-collection">Koleksi</TabsTrigger>
            <TabsTrigger value="rules" className="font-display rounded-xl px-4 py-2" data-testid="tab-rules">Cara Main</TabsTrigger>
          </TabsList>
          <TabsContent value="cats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAT_ORDER.map((id) => {
              const C = CATS[id];
              return (
                <Entry key={id} testid={`almanac-cat-${id}`} img={C.img} title={C.name} subtitle={C.role} desc={C.desc} accent={C.color}
                  stats={[["Harga", C.cost], ["HP", C.hp], [C.dmg ? "Damage" : "Energi", C.dmg || "+25"]]} />
              );
            })}
          </TabsContent>
          <TabsContent value="ghosts" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GHOST_ORDER.map((id) => {
              const G = GHOSTS[id];
              return (
                <Entry key={id} testid={`almanac-ghost-${id}`} img={G.img} title={G.name} subtitle={id === "boss" ? "Boss" : G.possessed ? "Possessed Object" : "Hantu"} desc={G.desc}
                  accent={id === "boss" ? "#a855f7" : "#fb7185"} stats={[["HP", G.hp], ["Cepat", G.speed], ["Poin", G.points]]} />
              );
            })}
          </TabsContent>
          <TabsContent value="collection">
            <p className="mb-4 text-sm text-slate-400">Kucing unik yang bisa dikumpulkan. Fitur Cat Collection segera hadir!</p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {COLLECTION.map((c) => (
                <div key={c.id} className="panel relative flex flex-col items-center gap-2 p-4 text-center" data-testid={`collection-${c.id}`}>
                  <img src={c.img} alt={c.name} className="h-28 w-28 object-contain opacity-80 grayscale" />
                  <div className="font-display">{c.name}</div>
                  <p className="text-xs text-slate-400">{c.desc}</p>
                  <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-bold text-amber-200"><Lock size={10} /> Segera</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="rules" className="grid gap-4 md:grid-cols-2">
            <Mechanic icon={Smile} color="#fde047" title="Mood Kucing">
              <p><b className="text-amber-300">Happy (^^)</b>: damage +20% — saat kenyang.</p>
              <p><b className="text-rose-300">Marah (!!)</b>: serangan lebih cepat — saat digigit hantu.</p>
              <p><b className="text-sky-300">Mengantuk (Zz)</b>: serangan melambat — saat lapar.</p>
              <p>Beri <b>Snack</b> ({SNACK_COST} Moonlight) agar kucing kembali Happy.</p>
            </Mechanic>
            <Mechanic icon={Moon} color="#818cf8" title="Siang & Malam">
              <p><Sun size={14} className="inline text-amber-300" /> <b>Siang</b>: orb Moonlight jarang, hantu lebih lemah (HP 80%).</p>
              <p><Moon size={14} className="inline text-indigo-300" /> <b>Malam</b>: hantu lebih banyak, boss muncul, Ninja & Ghost Hunter +25% damage, Solar Cat lebih produktif.</p>
            </Mechanic>
            <Mechanic icon={Sparkles} color="#38bdf8" title="Evolusi Kucing">
              <p>Kucing yang mengusir hantu mendapat pengalaman dan berevolusi:</p>
              <p className="font-display text-base">{EVO_NAMES.join("  →  ")}</p>
              <p>Setiap tingkat menambah damage & HP, dan memulihkan HP penuh.</p>
            </Mechanic>
            <Mechanic icon={Flame} color="#a855f7" title="Skill Raja Hantu">
              {Object.values(BOSS_SKILLS).map((b) => <p key={b.name}><b className="text-fuchsia-300">{b.name}</b> {b.desc}.</p>)}
              <p><Heart size={14} className="inline text-pink-400" /> Kucing yang kerasukan bisa dibebaskan dengan Snack.</p>
            </Mechanic>
            <div className="panel flex items-center gap-4 p-5 md:col-span-2">
              <img src={A("moon_orb")} alt="" className="h-14 w-14" />
              <p className="text-sm text-slate-300">Klik/tap orb bulan untuk +25 Moonlight. Pilih kartu kucing lalu tap petak halaman. Pintasan keyboard: <b>1-6</b> kartu, <b>F</b> snack, <b>S</b> sekop, <b>Spasi</b> jeda, <b>Esc</b> batal.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
