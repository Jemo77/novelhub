"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import FontFamily from "@tiptap/extension-font-family";
import { 
  Image as ImageIcon, X, Bold, Italic, Strikethrough, Heading1, Heading2, 
  List, ListOrdered, Quote, Underline as UnderlineIcon, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, Link as LinkIcon, Unlink, Superscript as SuperscriptIcon, 
  Subscript as SubscriptIcon
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { subirCapituloAction } from "@/app/actions/monetizacion";

const MAX_CHARACTERS = 50000;

export default function SubirCapituloPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  
  const obraId = params.id as string;
  const tipo = searchParams.get("tipo") || "novela"; // "novela" o "comic"

  const [numero, setNumero] = useState("");
  const [titulo, setTitulo] = useState("");
  const [esPremium, setEsPremium] = useState(false);
  const [precioUSDT, setPrecioUSDT] = useState("");
  const [duracionHoras, setDuracionHoras] = useState("");
  const [duracionIndefinida, setDuracionIndefinida] = useState(false);
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [imagenesPreview, setImagenesPreview] = useState<string[]>([]);
  
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
      }),
      TextStyle,
      Color,
      Superscript,
      Subscript,
      FontFamily,
      CharacterCount.configure({
        limit: MAX_CHARACTERS,
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4 border border-gray-300 dark:border-gray-600 rounded-b-lg bg-white dark:bg-gray-800 dark:text-white",
      },
    },
  });

  useEffect(() => {
    return () => {
      imagenesPreview.forEach(URL.revokeObjectURL);
    };
  }, [imagenesPreview]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setImagenes(prev => [...prev, ...newFiles]);
      
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagenesPreview(prev => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
    setImagenesPreview(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const formData = new FormData();
      formData.append("obraId", obraId);
      formData.append("tipo", tipo);
      formData.append("numero", numero);
      formData.append("titulo", titulo);
      formData.append("esPremium", String(esPremium));
      formData.append("precioUSDT", esPremium ? precioUSDT : "");
      formData.append("duracionHoras", esPremium ? (duracionIndefinida ? "null" : duracionHoras) : "null");

      if (tipo === "novela") {
        if (!editor) throw new Error("El editor no está listo");
        const contenido = editor.getHTML();

        if (!contenido || contenido === "<p></p>") {
          throw new Error("El contenido del capítulo no puede estar vacío");
        }

        formData.append("contenido", contenido);
      } else {
        if (imagenes.length === 0) {
          throw new Error("Debes subir al menos una imagen");
        }

        imagenes.forEach((img) => formData.append("imagenes", img));
      }

      const result = await subirCapituloAction(formData);

      if (!result.ok) {
        throw new Error(result.data?.error || result.data?.mensaje || "Error al subir el capítulo");
      }

      showToast({ type: "success", title: "¡Publicado!", message: "El capítulo se ha subido correctamente" });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primario dark:text-primario-light">Subir Capítulo de {tipo === "novela" ? "Novela" : "Cómic"}</h1>
        <Button variant="secundario" onClick={() => router.back()}>Volver</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-md">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número de Capítulo</label>
            <input
              type="number"
              min="1"
              required
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primario focus:border-primario bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Ej: 1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título del Capítulo</label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primario focus:border-primario bg-white dark:bg-gray-700 dark:text-white"
              placeholder="Ej: El comienzo"
            />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/60 p-4 space-y-4">
          <label className="flex items-center gap-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={esPremium}
              onChange={(e) => setEsPremium(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primario focus:ring-primario"
            />
            Capítulo Premium
          </label>

          {esPremium ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio (USDT)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precioUSDT}
                  onChange={(e) => setPrecioUSDT(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primario focus:border-primario bg-white dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: 0.50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Expiración (Horas)</label>
                  <button
                    type="button"
                    onClick={() => setDuracionIndefinida((actual) => !actual)}
                    className={"text-xs font-semibold px-3 py-1 rounded-full border transition " + (duracionIndefinida ? "bg-primario text-white border-primario" : "bg-white text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600")}
                  >
                    Indefinido
                  </button>
                </div>
                <input
                  type="number"
                  min="1"
                  step="1"
                  disabled={duracionIndefinida}
                  value={duracionHoras}
                  onChange={(e) => setDuracionHoras(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primario focus:border-primario bg-white dark:bg-gray-700 dark:text-white disabled:opacity-60"
                  placeholder={duracionIndefinida ? "Se enviará null" : "Ej: 48"}
                />
              </div>
            </div>
          ) : null}
        </div>

        {tipo === "novela" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contenido</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-700/50 flex flex-wrap gap-1 p-2">
              {editor && (
                <>
                  <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("bold") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Negrita">
                    <Bold size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("italic") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Cursiva">
                    <Italic size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("underline") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Subrayado">
                    <UnderlineIcon size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("strike") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Tachado">
                    <Strikethrough size={18} />
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("heading", { level: 1 }) ? "bg-gray-200 dark:bg-gray-600" : "")} title="Título 1">
                    <Heading1 size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("heading", { level: 2 }) ? "bg-gray-200 dark:bg-gray-600" : "")} title="Título 2">
                    <Heading2 size={18} />
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  
                  <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive({ textAlign: 'left' }) ? "bg-gray-200 dark:bg-gray-600" : "")} title="Alinear a la izquierda">
                    <AlignLeft size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive({ textAlign: 'center' }) ? "bg-gray-200 dark:bg-gray-600" : "")} title="Centrar">
                    <AlignCenter size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive({ textAlign: 'right' }) ? "bg-gray-200 dark:bg-gray-600" : "")} title="Alinear a la derecha">
                    <AlignRight size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive({ textAlign: 'justify' }) ? "bg-gray-200 dark:bg-gray-600" : "")} title="Justificar">
                    <AlignJustify size={18} />
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  
                  <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("bulletList") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Lista con viñetas">
                    <List size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("orderedList") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Lista numerada">
                    <ListOrdered size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("blockquote") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Cita">
                    <Quote size={18} />
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  
                  <button type="button" onClick={setLink} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("link") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Insertar enlace">
                    <LinkIcon size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50" title="Quitar enlace">
                    <Unlink size={18} />
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  
                  <button type="button" onClick={() => editor.chain().focus().toggleSuperscript().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("superscript") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Superíndice">
                    <SuperscriptIcon size={18} />
                  </button>
                  <button type="button" onClick={() => editor.chain().focus().toggleSubscript().run()} className={"p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 " + (editor.isActive("subscript") ? "bg-gray-200 dark:bg-gray-600" : "")} title="Subíndice">
                    <SubscriptIcon size={18} />
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                  
                  <input
                    type="color"
                    onInput={(event) => {
                      const target = event.target as HTMLInputElement;
                      editor.chain().focus().setColor(target.value).run();
                    }}
                    value={editor.getAttributes('textStyle').color || '#000000'}
                    className="w-8 h-8 p-1 border-0 rounded cursor-pointer"
                    title="Color de texto"
                  />
                </>
              )}
            </div>
            <EditorContent editor={editor} />
            {editor && (
              <div className="text-right text-sm text-gray-500 dark:text-gray-400 mt-2">
                {editor?.storage?.characterCount?.characters() || 0} / {MAX_CHARACTERS} caracteres
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Páginas del Cómic (Dimensiones obligatorias: 1080x2340 vertical)</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center bg-gray-50 dark:bg-gray-700/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="comic-images"
              />
              <label htmlFor="comic-images" className="cursor-pointer flex flex-col items-center justify-center">
                <ImageIcon className="text-gray-400 w-12 h-12 mb-3" />
                <span className="text-primario font-medium">Haz clic para seleccionar imágenes</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">Puedes seleccionar múltiples imágenes a la vez</span>
              </label>
            </div>

            {imagenesPreview.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Imágenes seleccionadas ({imagenesPreview.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {imagenesPreview.map((preview, index) => (
                    <div key={index} className="relative group aspect-[1/1.5] border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <img src={preview} alt={"Página " + (index + 1)} className="object-cover w-full h-full" />
                      <div className="absolute top-1 right-1">
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-1">
                        Pág. {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <Button type="submit" variant="primario" className="px-8" disabled={cargando}>
            {cargando ? "Subiendo..." : "Publicar Capítulo"}
          </Button>
        </div>
      </form>
    </div>
  );
}