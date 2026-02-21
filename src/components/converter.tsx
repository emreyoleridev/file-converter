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
        <div className="w-full max-w-[1100px] mx-auto font-sans relative z-10 px-4">
            {/* Tabs Navigation - Improved Responsive Layout */}
            <div className="flex justify-center mb-16 w-full">
                <Tabs value={activeTab} onValueChange={(val) => {
                    setActiveTab(val as CategoryId | 'all');
                    if (val !== 'all') {
                        setDetectedCategory(null);
                        setOutputFormat('');
                    }
                }} className="w-full">
                    <TabsList className="!h-auto bg-muted/50 backdrop-blur-xl p-2 rounded-[2rem] border border-border flex flex-wrap items-center justify-center gap-2 w-full">
                        <TabsTrigger
                            value="all"
                            className="!h-auto flex flex-col items-center justify-center gap-1 py-3 px-5 rounded-[1.5rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 data-[state=active]:bg-emerald-600 data-[state=active]:text-white text-muted-foreground hover:text-foreground border-0 shadow-none min-w-[90px] sm:min-w-[110px] flex-1 sm:flex-initial"
                        >
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5" />
                            Magic All
                        </TabsTrigger>

                        {CATEGORIES.map((cat, index) => {
                            const trigger = (
                                <TabsTrigger
                                    key={cat.id}
                                    value={cat.id}
                                    className="!h-auto flex flex-col items-center justify-center gap-1 py-3 px-5 rounded-[1.5rem] text-[10px] sm:text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 data-[state=active]:bg-foreground data-[state=active]:text-background text-muted-foreground hover:text-foreground border-0 shadow-none min-w-[90px] sm:min-w-[110px] flex-1 sm:flex-initial"
                                >
                                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 mb-0.5 flex items-center justify-center">
                                        {getIconForCategory(cat.id)}
                                    </div>
                                    {cat.name}
                                </TabsTrigger>
                            );

                            // "Magic All" + 5 categories = 6 top row items. Index 4 is the 5th category.
                            if (index === 4) {
                                return [
                                    trigger,
                                    <div key="break" className="hidden min-[900px]:block basis-full h-0" />
                                ];
                            }

                            return trigger;
                        })}
                    </TabsList>
                </Tabs>
            </div>

            {/* Main Converter Card */}
            <div className="bg-card/50 backdrop-blur-sm rounded-[2rem] border border-border p-4 sm:p-6 shadow-2xl transition-colors duration-500 relative z-10">

                {/* Dropzone */}
                <div
                    {...getRootProps()}
                    className={`
                        relative border border-dashed rounded-[1.5rem] p-10 sm:p-16 text-center cursor-pointer transition-all duration-500
                        ${isDragActive ? `border-emerald-500 bg-emerald-500/5 scale-[0.99]` : `border-border hover:border-emerald-500/50 hover:bg-muted/30`}
                    `}
                >
                    <input {...getInputProps()} />

                    <div className="w-12 h-12 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <Upload className="w-6 h-6 stroke-[1.5]" />
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mb-2">
                        {isDragActive ? 'Drop files here' : 'Click to upload or drag and drop'}
                    </h2>
                    <p className="text-muted-foreground font-bold text-xs tracking-wide">
                        Any size. 100% processed entirely on your device.
                    </p>
                </div>

                {/* File List */}
                {files.length > 0 && (
                    <div className="mt-10 space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-muted/40 border border-border">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-[10px]">
                                        {file.name.split('.').pop()?.toUpperCase() || 'FILE'}
                                    </div>
                                    <div className="truncate text-left">
                                        <p className="font-bold text-sm text-foreground truncate">{file.name}</p>
                                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                    className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-full h-8 w-8"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Bar */}
                <div className="mt-10 pt-10 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="w-full sm:w-[280px]">
                        <Select value={outputFormat} onValueChange={setOutputFormat}>
                            <SelectTrigger className="h-[3.5rem] rounded-2xl border-border bg-muted/50 text-foreground font-black uppercase tracking-wider hover:bg-muted transition-all">
                                <SelectValue placeholder="Convert To" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border text-popover-foreground rounded-2xl">
                                {currentFormats.out.map((fmt) => (
                                    <SelectItem key={fmt} value={fmt} className="font-black uppercase tracking-widest py-3">
                                        {fmt}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <Button
                        onClick={handleConvert}
                        disabled={isDisabled}
                        className={`
                                w-full sm:w-[240px] h-[3.5rem] rounded-2xl text-[14px] font-black uppercase tracking-[0.1em] transition-all duration-500
                                ${isDisabled
                                ? 'bg-muted text-muted-foreground opacity-50'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_8px_30px_rgb(5,150,105,0.3)] hover:shadow-[0_8px_40px_rgb(5,150,105,0.4)] hover:-translate-y-0.5'
                            }
                            `}
                    >
                        {isConverting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing
                            </div>
                        ) : (
                            'Convert Now'
                        )}
                    </Button>
                </div>

                {/* Progress Bar */}
                {isConverting && (
                    <div className="mt-8 space-y-3">
                        <div className="flex justify-between text-[11px] font-black tracking-widest uppercase text-emerald-500">
                            <span>Processing locally</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full bg-muted overflow-hidden [&>div]:bg-emerald-500" />
                    </div>
                )}
            </div>
        </div>
    );
}
