"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Music,
  Sparkles,
  FileText,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  ChevronRight,
  Disc3,
  Mic2,
  Wand2,
  Volume2,
  Download,
  Copy,
  Check,
} from "lucide-react";

type Step = "input" | "concept" | "lyrics" | "music" | "result";

interface ConceptData {
  concept: string;
  tags: string;
  title: string;
}

interface LyricsData {
  song_title?: string;
  style_tags?: string;
  lyrics?: string;
  data?: {
    title?: string;
    tags?: string;
    lyrics?: string;
  };
}

interface MusicData {
  data?: {
    audio?: string;
    status?: number;
  };
}

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "input", label: "灵感", icon: <Sparkles size={16} /> },
  { id: "concept", label: "构思", icon: <Wand2 size={16} /> },
  { id: "lyrics", label: "歌词", icon: <FileText size={16} /> },
  { id: "music", label: "谱曲", icon: <Music size={16} /> },
  { id: "result", label: "成品", icon: <Disc3 size={16} /> },
];

const STYLE_CATEGORIES: { label: string; tags: string[] }[] = [
  { label: "风格", tags: ["流行", "摇滚", "民谣", "电子", "R&B", "嘻哈", "古风", "爵士", "舞曲", "蓝调", "朋克", "灵魂乐"] },
  { label: "情绪", tags: ["欢快", "伤感", "浪漫", "激昂", "温柔", "忧郁", "治愈", "热血", "梦幻", "深情", "轻松", "孤独"] },
  { label: "场景", tags: ["夏天", "雨天", "夜晚", "校园", "旅行", "城市", "海边", "星空", "咖啡馆", "公路"] },
];


function StepIndicator({
  currentStep,
  onStepClick,
}: {
  currentStep: Step;
  onStepClick: (step: Step) => void;
}) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-8">
      {STEPS.map((step, i) => {
        const isActive = step.id === currentStep;
        const isDone = i < currentIndex;
        const isClickable = isDone;

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : isDone
                  ? "bg-primary/20 text-primary-light cursor-pointer hover:bg-primary/30"
                  : "bg-surface-light text-foreground/30"
              }`}
            >
              {step.icon}
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight
                size={14}
                className={isDone ? "text-primary-light" : "text-foreground/15"}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function AudioPlayer({ url }: { url: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface rounded-2xl border border-border">
      <audio ref={audioRef} src={url} preload="metadata" />
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors flex-shrink-0"
        >
          {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
        <div className="flex-1 flex flex-col gap-1.5">
          <div
            className="w-full h-2 bg-surface-light rounded-full cursor-pointer group"
            onClick={seek}
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-foreground/40 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <Volume2 size={16} className="text-foreground/30" />
      </div>
    </div>
  );
}

function LyricsDisplay({ lyrics }: { lyrics: string }) {
  const [copied, setCopied] = useState(false);
  const formatted = lyrics.replace(
    /\[(.*?)\]/g,
    '<span class="tag">[$1]</span>'
  );

  const copyToClipboard = () => {
    navigator.clipboard.writeText(lyrics);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={copyToClipboard}
        className="absolute right-0 top-0 p-2 rounded-lg bg-surface-light border border-border text-foreground/40 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
        title="复制歌词"
      >
        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
      </button>
      <div
        className="lyrics-display text-sm text-foreground/80 max-h-80 overflow-y-auto pr-2 scrollbar-thin"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    </div>
  );
}

export default function MusicWorkshop() {
  const [step, setStep] = useState<Step>("input");
  const [theme, setTheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [concept, setConcept] = useState<ConceptData | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editConcept, setEditConcept] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [singerRef, setSingerRef] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [lyricsTitle, setLyricsTitle] = useState("");
  const [lyricsTags, setLyricsTags] = useState("");
  const [musicUrlFemale, setMusicUrlFemale] = useState("");
  const [musicUrlMale, setMusicUrlMale] = useState("");
  const [selectedVersion, setSelectedVersion] = useState<"female" | "male">("female");
  const [styleTags, setStyleTags] = useState("");

  const handleGenerateConcept = useCallback(async () => {
    if (!theme.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setConcept(data);
      setEditTitle(data.title || "");
      setEditConcept(data.concept || "");
      setStyleTags(data.tags || "");
      setStep("concept");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成构思失败");
    } finally {
      setLoading(false);
    }
  }, [theme]);

  const handleGenerateLyrics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const styles = selectedStyles.size > 0
        ? Array.from(selectedStyles).join(", ")
        : styleTags;
      const singerPart = singerRef ? `。参考歌手: ${singerRef}的风格` : "";
      const prompt = editConcept
        ? `${editConcept}。风格: ${styles}${singerPart}`
        : `${theme}。风格: ${styles}${singerPart}`;
      const title = editTitle || concept?.title || "";

      const res = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, title }),
      });
      const data: LyricsData = await res.json();
      if (!res.ok) throw new Error("歌词生成失败");

      setLyrics(data.lyrics || data.data?.lyrics || "");
      setLyricsTitle(data.song_title || data.data?.title || concept?.title || "");
      const userStyles = selectedStyles.size > 0 ? Array.from(selectedStyles).join(", ") : "";
      setLyricsTags(userStyles || styleTags || data.style_tags || data.data?.tags || concept?.tags || "");
      if (!userStyles && data.style_tags) setStyleTags(data.style_tags);
      setStep("lyrics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "歌词生成失败");
    } finally {
      setLoading(false);
    }
  }, [editConcept, editTitle, concept, theme, selectedStyles, styleTags, singerRef]);

  const handleGenerateMusic = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const basePrompt = `${[...Array.from(selectedStyles), styleTags || lyricsTags || "流行"].filter(Boolean).join(", ")}${singerRef ? `, ${singerRef}风格` : ""}`;

      const [resFemale, resMale] = await Promise.all([
        fetch("/api/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `${basePrompt}, 女声`,
            lyrics: lyrics || undefined,
            isInstrumental: false,
          }),
        }),
        fetch("/api/music", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `${basePrompt}, 男声`,
            lyrics: lyrics || undefined,
            isInstrumental: false,
          }),
        }),
      ]);

      const [dataFemale, dataMale] = await Promise.all([
        resFemale.json() as Promise<MusicData>,
        resMale.json() as Promise<MusicData>,
      ]);

      const urlFemale = dataFemale.data?.audio || "";
      const urlMale = dataMale.data?.audio || "";
      if (!urlFemale && !urlMale) throw new Error("未获取到音频地址");

      setMusicUrlFemale(urlFemale);
      setMusicUrlMale(urlMale);
      setSelectedVersion(urlFemale ? "female" : "male");
      setStep("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "音乐生成失败");
    } finally {
      setLoading(false);
    }
  }, [selectedStyles, styleTags, lyricsTags, lyrics, singerRef]);

  const handleReset = () => {
    setStep("input");
    setTheme("");
    setConcept(null);
    setEditTitle("");
    setEditConcept("");
    setSelectedStyles(new Set());
    setSingerRef("");
    setLyrics("");
    setLyricsTitle("");
    setLyricsTags("");
    setMusicUrlFemale("");
    setMusicUrlMale("");
    setSelectedVersion("female");
    setStyleTags("");
    setError("");
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <main className="relative z-10 flex flex-col w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2.5 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Sparkles className="text-primary" size={16} />
            <span className="text-xs font-medium text-foreground/60 uppercase tracking-wider">Next-Gen AI Music Experience</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">灵感随心，</span>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">乐动随行</span>
          </h1>
          <p className="text-sm sm:text-base text-foreground/40 max-w-md mx-auto">
            全链路 AI 音乐创作工坊。从一个想法到一首完整的歌，只需几分钟。
          </p>
        </div>

        <StepIndicator currentStep={step} onStepClick={setStep} />

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        {/* Step: Input */}
        {step === "input" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <label className="text-sm font-semibold text-foreground/80 mb-4 block">
                你的创作灵感
              </label>
              <textarea
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="例如：一首关于夏天海边的轻快歌曲，适合开车兜风的时候听..."
                className="w-full h-40 bg-white/5 rounded-2xl border border-white/10 p-5 text-sm sm:text-base text-foreground placeholder:text-foreground/20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {["夏日海边的快乐", "深夜独自一人的思念", "毕业季的青春回忆", "雨天窗边的咖啡时光"].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setTheme(tag)}
                      className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-foreground/50 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateConcept}
              disabled={!theme.trim() || loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span>正在构思奇迹...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles size={20} />
                  <span>开启创作之旅</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Step: Concept */}
        {step === "concept" && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col gap-6">
              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">歌曲名称</label>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="给你的歌起个名字"
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">核心创意</label>
                <textarea
                  value={editConcept}
                  onChange={(e) => setEditConcept(e.target.value)}
                  placeholder="描述你心中歌曲的画面、故事、情感..."
                  rows={3}
                  className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-sm text-foreground placeholder:text-foreground/20 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-primary uppercase tracking-widest mb-2 block">参考歌手 (可选)</label>
                  <input
                    value={singerRef}
                    onChange={(e) => setSingerRef(e.target.value)}
                    placeholder="如：周杰伦..."
                    className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                  />
                </div>
                <div className="flex items-end">
                  <p className="text-[10px] text-foreground/20 leading-relaxed">
                    填写后 AI 将尝试捕捉特定歌手的韵律感与音色特征。
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-primary uppercase tracking-widest mb-3 block">风格定义</label>
                {STYLE_CATEGORIES.map((cat) => (
                  <div key={cat.label} className="mb-4 last:mb-0">
                    <p className="text-[10px] text-foreground/30 font-medium uppercase tracking-wider mb-2">{cat.label}</p>
                    <div className="flex flex-wrap gap-2">
                      {cat.tags.map((tag) => {
                        const selected = selectedStyles.has(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => {
                              const next = new Set(selectedStyles);
                              if (selected) next.delete(tag); else next.add(tag);
                              setSelectedStyles(next);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                              selected
                                ? "bg-primary/20 border-primary/40 text-primary-light shadow-lg shadow-primary/10"
                                : "bg-white/5 border-white/5 text-foreground/40 hover:text-foreground/60 hover:bg-white/10"
                            }`}
                          >
                            {tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateLyrics}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span>正在编织词章...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <FileText size={20} />
                  <span>生成绝妙歌词</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Step: Lyrics */}
        {step === "lyrics" && lyrics && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">{lyricsTitle}</h3>
                  {lyricsTags && (
                    <p className="text-xs font-medium text-primary-light/60 mt-1 uppercase tracking-wider">
                      {lyricsTags}
                    </p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText size={20} className="text-primary" />
                </div>
              </div>
              <LyricsDisplay lyrics={lyrics} />
            </div>

            <div className="glass-card rounded-2xl p-6 flex flex-col gap-4">
              <label className="text-xs font-bold text-primary uppercase tracking-widest">最终风格确认</label>
              <div className="flex flex-wrap gap-2">
                {selectedStyles.size > 0 && Array.from(selectedStyles).map((s) => (
                  <span key={s} className="px-3 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-medium border border-primary/20">{s}</span>
                ))}
              </div>
              <input
                value={styleTags}
                onChange={(e) => setStyleTags(e.target.value)}
                className="w-full bg-white/5 rounded-xl border border-white/10 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                placeholder="在此补充或修改风格标签..."
              />
            </div>

            <button
              onClick={handleGenerateMusic}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-accent to-primary text-white font-bold text-base shadow-xl shadow-accent/20 hover:shadow-accent/40 hover:-translate-y-0.5 transition-all disabled:opacity-40"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={20} className="animate-spin" />
                  <span>正在谱写旋律 (约需 1 分钟)...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Music size={20} />
                  <span>生成完整单曲</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Step: Music generating */}
        {step === "music" && (
          <div className="flex flex-col items-center justify-center gap-8 py-20 animate-in fade-in scale-in-95 duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-[60px] animate-pulse-glow" />
              <Disc3
                size={120}
                className="text-primary animate-spin-slow relative z-10"
              />
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <Music size={32} className="text-accent animate-bounce" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-white text-lg font-bold mb-2">灵感正在转化为律动</p>
              <p className="text-foreground/40 text-sm">AI 正在根据你的词曲进行全方位编曲...</p>
            </div>
          </div>
        )}

        {/* Step: Result */}
        {step === "result" && (musicUrlFemale || musicUrlMale) && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="glass-card rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                  <Music size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{lyricsTitle || "AI 杰作"}</h3>
                  <p className="text-xs font-medium text-foreground/40 mt-1 uppercase tracking-widest">
                    {styleTags || lyricsTags}
                  </p>
                </div>
              </div>

              <div className="flex p-1.5 bg-white/5 rounded-2xl mb-6 border border-white/5">
                {musicUrlFemale && (
                  <button
                    onClick={() => setSelectedVersion("female")}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedVersion === "female"
                        ? "bg-white text-black shadow-lg"
                        : "text-foreground/40 hover:text-foreground/60 hover:bg-white/5"
                    }`}
                  >
                    ♀ 女声演绎版
                  </button>
                )}
                {musicUrlMale && (
                  <button
                    onClick={() => setSelectedVersion("male")}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                      selectedVersion === "male"
                        ? "bg-white text-black shadow-lg"
                        : "text-foreground/40 hover:text-foreground/60 hover:bg-white/5"
                    }`}
                  >
                    ♂ 男声演绎版
                  </button>
                )}
              </div>

              <AudioPlayer
                key={selectedVersion}
                url={selectedVersion === "female" ? musicUrlFemale : musicUrlMale}
              />

              <div className="mt-6">
                <a
                  href={selectedVersion === "female" ? musicUrlFemale : musicUrlMale}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold flex items-center justify-center gap-2 text-foreground/80 hover:bg-white/10 hover:text-white transition-all"
                >
                  <Download size={18} />
                  下载 MP3 音轨
                </a>
              </div>
            </div>

            {lyrics && (
              <details className="glass-card rounded-2xl overflow-hidden transition-all group">
                <summary className="px-6 py-4 text-sm font-bold text-foreground/60 cursor-pointer hover:text-white flex items-center justify-between transition-colors list-none">
                  <span>查看完整歌词</span>
                  <ChevronRight size={16} className="group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-6 pb-6 pt-2 border-t border-white/5">
                  <LyricsDisplay lyrics={lyrics} />
                </div>
              </details>
            )}

            <button
              onClick={handleReset}
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold flex items-center justify-center gap-2 text-foreground/40 hover:bg-white/10 hover:text-primary transition-all"
            >
              <RotateCcw size={18} />
              开启新的创作
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
