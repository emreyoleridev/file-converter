'use client';

import { useState } from 'react';
import { CATEGORIES, CategoryId, FORMATS } from '@/lib/formats';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Trash2, Loader2, Sparkles, Layers, Image as ImageIcon, Video, Music, Archive, Book, Type, Box, Code, MessageSquare, ChevronDown } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { convertFile } from '@/utils/convertFile';
import JSZip from 'jszip';

const getIconForCategory = (id: string) => {
    switch (id) {
        case 'document': return <Code className="w-3.5 h-3.5" />;
        case 'image': return <ImageIcon className="w-3.5 h-3.5" />;
        case 'video': return <Video className="w-3.5 h-3.5" />;
        case 'audio': return <Music className="w-3.5 h-3.5" />;
        case 'archive': return <Archive className="w-3.5 h-3.5" />;
        case 'ebook': return <Book className="w-3.5 h-3.5" />;
        case 'font': return <Type className="w-3.5 h-3.5" />;
        case 'cad3d': return <Box className="w-3.5 h-3.5" />;
        case 'developer': return <Code className="w-3.5 h-3.5" />;
        case 'subtitle': return <MessageSquare className="w-3.5 h-3.5" />;
        default: return <Layers className="w-3.5 h-3.5" />;
    }
};

export function Converter() {
    const [activeTab, setActiveTab] = useState<CategoryId | 'all'>('all');
    const [detectedCategory, setDetectedCategory] = useState<CategoryId | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [outputFormat, setOutputFormat] = useState<string>('');
    const [isConverting, setIsConverting] = useState(false);
    const [progress, setProgress] = useState(0);

    const effectiveCategory = activeTab === 'all'
        ? (detectedCategory || 'document')
        : activeTab;

    const currentFormats = FORMATS[effectiveCategory];

    const detectCategoryFromExtension = (filename: string): CategoryId | null => {
        const ext = filename.split('.').pop()?.toLowerCase() || '';
        for (const cat of CATEGORIES) {
            if (FORMATS[cat.id].in.includes(ext)) {
                return cat.id;
            }
        }
        return null;
    };

    const onDrop = (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        const firstFile = acceptedFiles[0];
        const ext = firstFile.name.split('.').pop()?.toLowerCase() || '';

        let newCat: CategoryId | null = null;

        if (activeTab === 'all') {
            newCat = detectCategoryFromExtension(firstFile.name);
            if (newCat) {
                setDetectedCategory(newCat);
                if (outputFormat && !FORMATS[newCat].out.includes(outputFormat)) {
                    setOutputFormat('');
                }
                toast.success(`Auto-detected ${newCat.toUpperCase()} format!`);
            } else {
                toast.warning(`Could not auto-detect category for .${ext}`);
            }
        } else {
            const currentCatFormats = FORMATS[activeTab];
            if (!currentCatFormats.in.includes(ext)) {
                const autoCat = detectCategoryFromExtension(firstFile.name);
                if (autoCat) {
                    setActiveTab(autoCat);
                    toast.success(`Auto-switched to ${autoCat.toUpperCase()} tab!`);
                }
            }
        }

        setFiles(prev => [...prev, ...acceptedFiles]);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: true,
    });

    const handleConvert = async () => {
        if (files.length === 0) {
            toast.error('Please upload at least one file first.');
            return;
        }
        if (!outputFormat) {
            toast.error('Please select an output format.');
            return;
        }

        setIsConverting(true);
        setProgress(0);

        try {
            let completed = 0;
            const zip = new JSZip();

            for (const file of files) {
                const catForFile = activeTab === 'all'
                    ? (detectCategoryFromExtension(file.name) || effectiveCategory)
                    : effectiveCategory;

                const blob = await convertFile(file, catForFile, outputFormat, (p) => {
                    setProgress((completed / files.length) * 100 + (p / files.length));
                });

                const originalName = file.name.split('.').slice(0, -1).join('.');
                const outName = `${originalName || 'converted'}.${outputFormat}`;

                if (files.length > 1) {
                    zip.file(outName, blob);
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = outName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }

                completed++;
                setProgress((completed / files.length) * 100);
            }

            if (files.length > 1) {
                const zipBlob = await zip.generateAsync({
                    type: 'blob',
                    compression: "DEFLATE",
                    compressionOptions: { level: 5 }
                });
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `converted_files.zip`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            toast.success(`Successfully converted ${files.length} file(s)!`);
            setFiles([]);
            setOutputFormat('');
        } catch (e: any) {
            toast.error(e.message || 'An error occurred during conversion.');
        } finally {
            setIsConverting(false);
            setProgress(0);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        if (files.length === 1) {
            if (activeTab === 'all') setDetectedCategory(null);
            setOutputFormat('');
        }
    };

    const isDisabled = files.length === 0 || !outputFormat || isConverting;

    return (
        <div className="w-full max-w-[800px] mx-auto font-sans relative z-10">
            {/* Minimalist Tab Navigation */}
            <div className="flex justify-center mb-8">
                <Tabs value={activeTab} onValueChange={(val) => {
                    setActiveTab(val as CategoryId | 'all');
                    if (val !== 'all') {
                        setDetectedCategory(null);
                        setOutputFormat('');
                    }
                }} className="w-full">
                    <TabsList className="w-full h-auto flex flex-wrap justify-center gap-x-6 gap-y-3 bg-transparent p-0 border-0">
                        <TabsTrigger
                            value="all"
                            className="flex items-center gap-1.5 px-0 py-0 text-[13px] font-semibold text-slate-400 data-[state=active]:text-[#111827] dark:data-[state=active]:text-white bg-transparent border-0 data-[state=active]:bg-transparent shadow-none transition-all hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-wide"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Magic All
                        </TabsTrigger>

                        {CATEGORIES.map((cat) => (
                            <TabsTrigger
                                key={cat.id}
                                value={cat.id}
                                className="flex items-center gap-1.5 px-0 py-0 text-[13px] font-semibold text-slate-400 data-[state=active]:text-[#111827] dark:data-[state=active]:text-white bg-transparent border-0 data-[state=active]:bg-transparent shadow-none transition-all hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-wide capitalize"
                            >
                                {getIconForCategory(cat.id)}
                                {cat.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Main Primary Interaction Box */}
            <div className="bg-white dark:bg-[#18181B] rounded-[2.5rem] shadow-[0_30px_70px_-20px_rgba(0,0,0,0.06)] dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.3)] border border-slate-100/80 dark:border-zinc-800/50 p-6 sm:p-12 flex flex-col gap-10">

                <div className="text-center space-y-2">
                    <h2 className="text-[32px] font-bold tracking-tight text-[#111827] dark:text-white">
                        {activeTab === 'all'
                            ? "Drop any file to begin"
                            : `Upload ${effectiveCategory} files`}
                    </h2>
                    <p className="text-[15.5px] text-[#6B7280] dark:text-gray-400 font-medium">
                        {activeTab === 'all'
                            ? "We'll automatically detect the type and show options."
                            : `Upload your ${effectiveCategory} files to convert them instantly.`}
                    </p>
                </div>

                {/* Upload Zone */}
                <div
                    {...getRootProps()}
                    className={`
                        relative overflow-hidden border border-dashed rounded-[1.5rem] p-12 sm:p-20 text-center cursor-pointer transition-all duration-400 ease-in-out flex flex-col items-center justify-center min-h-[320px]
                        ${isDragActive ? `border-[#334155] bg-[#F8FAFC] dark:bg-zinc-800/40 scale-[1.005]` : `border-[#E5E7EB] dark:border-zinc-800/80 hover:border-[#64748B] dark:hover:border-zinc-600 hover:bg-[#F9FAFB] dark:hover:bg-zinc-800/20`}
                    `}
                >
                    <div className="absolute inset-0 bg-transparent" />
                    <input {...getInputProps()} />

                    <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center bg-[#F3F4F6] dark:bg-zinc-800 text-[#94A3B8] group-hover:bg-[#E5E7EB] dark:group-hover:bg-zinc-700 transition-colors">
                        <Upload className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    <p className="text-[22px] font-bold text-[#111827] dark:text-white">
                        {isDragActive ? 'Drop them right here' : 'Drag & drop your files'}
                    </p>
                    <p className="text-[#6B7280] dark:text-gray-400 mt-3 font-medium text-[15px] max-w-sm mx-auto leading-relaxed">
                        Support up to high resolutions. We compress & convert instantly on your device.
                    </p>
                </div>

                {files.length > 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 border-t border-slate-100 dark:border-zinc-800/50 pt-8">
                        <div className="flex items-center justify-between mb-5 px-1">
                            <h3 className="font-bold text-[17px] text-[#111827] dark:text-white">
                                Selected Files ({files.length})
                            </h3>
                            {activeTab === 'all' && detectedCategory && (
                                <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/20">
                                    Type: {detectedCategory}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 max-h-[220px] overflow-y-auto px-1 custom-scrollbar">
                            {files.map((file, i) => {
                                const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                                return (
                                    <div key={i} className="group flex items-center justify-between p-4 rounded-2xl bg-[#F8FAFC]/50 dark:bg-zinc-900/60 border border-slate-200/60 dark:border-zinc-800/60 shadow-none hover:border-[#CBD5E1] dark:hover:border-zinc-700 transition-all">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-800 text-[#94A3B8] font-bold text-[11px] shadow-sm border border-slate-100 dark:border-zinc-700/40 uppercase">
                                                {ext}
                                            </div>
                                            <div className="truncate">
                                                <p className="font-semibold text-[14.5px] truncate text-[#111827] dark:text-white leading-none mb-1.5">{file.name}</p>
                                                <p className="text-[12.5px] font-medium text-[#94A3B8] dark:text-gray-500 uppercase tracking-tighter italic">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-zinc-800 rounded-full h-9 w-9"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Footer Interaction Zone */}
                <div className="pt-8 border-t border-slate-100 dark:border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row items-end justify-between gap-6">
                        <div className="w-full sm:w-[240px] space-y-3">
                            <Label htmlFor="output-format" className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#94A3B8] dark:text-gray-500 ml-1">
                                CONVERT TO
                            </Label>
                            <Select value={outputFormat} onValueChange={setOutputFormat}>
                                <SelectTrigger id="output-format" className="h-[3rem] rounded-xl text-[15px] font-semibold border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-sm transition-all focus:ring-slate-300 dark:focus:ring-zinc-700">
                                    <SelectValue placeholder="Select output format" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-slate-200 dark:border-zinc-800 shadow-xl max-h-[300px]">
                                    {currentFormats.out.map((fmt) => (
                                        <SelectItem key={fmt} value={fmt} className="text-[14px] font-semibold py-3 uppercase cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800">
                                            .{fmt}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            onClick={handleConvert}
                            className={`
                                w-full sm:w-[200px] h-[3rem] rounded-xl text-[15.5px] font-bold transition-all duration-300
                                ${isDisabled
                                    ? 'bg-[#F9FAFB] dark:bg-zinc-900 text-[#CBD5E1] dark:text-zinc-700 shadow-none border border-slate-100 dark:border-zinc-800 pointer-events-none'
                                    : 'bg-[#111827] dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] active:scale-[0.98]'
                                }
                            `}
                            disabled={isDisabled}
                        >
                            {isConverting ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Converting...
                                </>
                            ) : (
                                files.length > 1 ? `Convert All (${files.length})` : 'Convert Files'
                            )}
                        </Button>
                    </div>

                    {activeTab === 'all' && !detectedCategory && files.length === 0 && (
                        <p className="text-[13.5px] font-medium text-amber-600 dark:text-amber-500 text-center mt-6">
                            Upload a file first so we can determine available output formats.
                        </p>
                    )}

                    {isConverting && (
                        <div className="pt-8 space-y-3 animate-in fade-in duration-300">
                            <div className="flex justify-between text-[12px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
                                <span className="animate-pulse">Processing Files...</span>
                                <span>{Math.round(progress)}%</span>
                            </div>
                            <Progress value={progress} className="h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden [&>div]:bg-[#111827] dark:[&>div]:bg-white" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
