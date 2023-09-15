import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { FileVideo, Upload } from 'lucide-react';
import { fetchFile } from '@ffmpeg/util';

import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { getFfmpeg } from '@/lib/ffmpeg';

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  async function convertVideoToAudio(video: File): Promise<File> {
    console.log('convert started');

    const ffmpeg = await getFfmpeg();

    await ffmpeg.writeFile('input.mp4', await fetchFile(video));

    ffmpeg.on('progress', progress => {
      console.log('Convert progress: ' + Math.round(progress.progress * 100));
    });

    await ffmpeg.exec([
      '-i',
      'input.mp4',
      '-map',
      '0:a',
      '-b:a',
      '20k',
      '-acodec',
      'libmp3lame',
      'output.mp3'
    ]);

    const data = await ffmpeg.readFile('output.mp3');

    const audioFileBlob = new Blob([data], { type: 'audio/mpeg' });
    const audioFile = new File([audioFileBlob], 'audio.mp3', {
      type: 'audio/mpeg'
    });


    console.log('conversion finished');

    return audioFile;
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if(!files) {
      return;
    }

    const selectedFile = files[0];
    setVideoFile(selectedFile)
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if(!videoFile) return;

    const audioFile = await convertVideoToAudio(videoFile);

    console.log(audioFile);

  }

  const previewUrl = useMemo(() => {
    if(!videoFile) return null;

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form onSubmit={handleUploadVideo} className="space-y-6">
      <label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5"
      >
        {previewUrl ? (
          <video
            src={previewUrl}
            controls={false}
            className="pointer-events-none inset-0"
          />
        ): (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um vídeo
          </>
        )}
      </label>

      <input
        type="file"
        id="video"
        accept="video/mp4"
        onChange={handleFileSelected}
        className="sr-only"
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          placeholder="Inclua palavras-chave mencionadas no vídeo separadas por vírgula (,)"
          id="transcription_prompt"
          className="h-20 leading-relaxed resize-none"
        />
      </div>

      <Button type="submit" className="w-full">
        Carregar vídeo
        <Upload className="w-4 h-4 ml-2" />
      </Button>
    </form>
  )
}
