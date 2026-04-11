import React, { useRef, useEffect, useState } from 'react';
import { Box, Button, IconButton, Select, MenuItem, Divider, Tooltip, Stack } from '@mui/material';
import { FormatBold, FormatItalic, FormatUnderlined, FormatAlignLeft, FormatAlignCenter, FormatAlignRight, Image as ImageIcon, Delete, Title, Undo, Redo } from '@mui/icons-material';
import '../css/style.css';

const url = import.meta.env.VITE_API_URL;
const MAX_HISTORY = 50;

const CommonEditor = ({ value, onChange, width = "100%", height = "450px" }) => {
  const editorRef = useRef(null);
  const [selectedImg, setSelectedImg] = useState(null);
  const fileInputRef = useRef(null);
  const [fontSize, setFontSize] = useState("3");
  const [history, setHistory] = useState([value || ""]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [pendingDeleteFiles, setPendingDeleteFiles] = useState([]);

  const displayPreview = (file) => {
    if (!file.type.match('image.*')) {
      alert("イメージファイルのみ可能です。");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const base64Source = e.target.result;
    
      if (editorRef.current) {
        editorRef.current.focus();
      }
      const imgHtml = `<img src="${base64Source}" data-is-new="true" style="max-width: 100%; height: auto; cursor: pointer;" />`;
      document.execCommand('insertHTML', false, imgHtml);
    
      handleInput();
    };

    reader.readAsDataURL(file);
  };

  
  const handleInput = () => {
    if(editorRef.current){
      const content = editorRef.current.innerHTML;
      onChange(content);
      saveHistory(content);
    }
  };

  const Style = (command, val = null) => {
    document.execCommand(command, false, val);
    
    editorRef.current.focus();
    handleInput();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) displayPreview(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      displayPreview(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleEditorClick = (e) =>{
    const imgs = editorRef.current.querySelectorAll('img');
    imgs.forEach(img => img.style.outline = 'none');

    if(e.target.tagName === 'IMG'){
      setSelectedImg(e.target);
      e.target.style.outline = '3px solid #1976d2';
    }else {
      setSelectedImg(null);
    }
  };

  const resizeImage = (widthPercent) => {
    if(selectedImg){
        selectedImg.style.width = widthPercent;
        selectedImg.style.height = 'auto';
        handleInput(); 
        editorRef.current.focus();
    }else {
        alert("サイズ変更する画像を最初にクリックしてください");
    }
  };

  const deleteImage = () => {
  if (selectedImg) {
    const fileName = selectedImg.getAttribute('data-filename');
    const isNew = selectedImg.getAttribute('data-is-new');

    if (fileName && !isNew) {
      setPendingDeleteFiles(prev => [...prev, fileName]);
    }

    selectedImg.remove();
    setSelectedImg(null);
    handleInput();
  }
};

  const handleUndo = (e) => {
    e.preventDefault();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevContent = history[prevIndex];
    
      if (editorRef.current) {
        editorRef.current.innerHTML = prevContent;
        setHistoryIndex(prevIndex);
        onChange(prevContent);
        editorRef.current.focus();
      }
    }
  };

  const handleRedo = (e) => {
  e.preventDefault();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextContent = history[nextIndex];
    
      if (editorRef.current) {
        editorRef.current.innerHTML = nextContent;
        setHistoryIndex(nextIndex);
        onChange(nextContent);
        editorRef.current.focus();
      }
    }
  };

  const saveHistory = (newContent) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      const updated = [...newHistory, newContent];
      if (updated.length > MAX_HISTORY) updated.shift();
      return updated;
    });
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  };

  //サーバーからデータを受け取ったとき,エディタの内容を更新
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && 
        document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);  


  return (
    <Box className="editor-container" sx={{ width, border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }} >
      <Stack 
        direction="row" 
        spacing={0.5} 
        alignItems="center" 
        sx={{ p: 1, borderBottom: '1px solid #ddd', bgcolor: '#f8f9fa', flexWrap: 'wrap', gap: '5px' }}
      >
        <Select
          native
          value={fontSize}
          size="small"
          onChange={(e) => {
            setFontSize(e.target.value);
            Style('fontSize', e.target.value);
          }}
          sx={{ height: 32, fontSize: '0.8rem', minWidth: 100, m: 0.5 }}
          displayEmpty
        >
          <option value="1">極小</option>
          <option value="2">小さい</option>
          <option value="3">標準</option>
          <option value="4">大きい</option>
          <option value="5">やや特大</option>
          <option value="6">特大</option>
          <option value="7">最大</option>
        </Select>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Tooltip title="元に戻す (Ctrl+Z)">
          <IconButton size="small" onMouseDown={handleUndo} disabled={historyIndex === 0} >
            <Undo />
          </IconButton>
        </Tooltip>
        <Tooltip title="やり直し (Ctrl+Y)">
          <IconButton size="small" onMouseDown={handleRedo} disabled={historyIndex >= history.length - 1} >
            <Redo />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Tooltip title="太字"><IconButton size="small" onClick={() => Style('bold')}><FormatBold /></IconButton></Tooltip>
        <Tooltip title="傾ける"><IconButton size="small" onClick={() => Style('italic')}><FormatItalic /></IconButton></Tooltip>
        <Tooltip title="下線"><IconButton size="small" onClick={() => Style('underline')}><FormatUnderlined /></IconButton></Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Tooltip title="左揃え"><IconButton size="small" onClick={() => Style('justifyLeft')}><FormatAlignLeft /></IconButton></Tooltip>
        <Tooltip title="中央揃え"><IconButton size="small" onClick={() => Style('justifyCenter')}><FormatAlignCenter /></IconButton></Tooltip>
        <Tooltip title="右揃え"><IconButton size="small" onClick={() => Style('justifyRight')}><FormatAlignRight /></IconButton></Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Tooltip title="文字色">
          <Box sx={{ display: 'flex', alignItems: 'center', px: 1 }}>
            <input 
              type="color" 
              onChange={(e) => Style('foreColor', e.target.value)}
              style={{ width: 24, height: 24, cursor: 'pointer', border: '1px solid #ddd', padding: 0 }}
            />
          </Box>
        </Tooltip>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Tooltip title="画像アップロード">
          <IconButton size="small" onClick={() => fileInputRef.current.click()} color="primary">
            <ImageIcon />
          </IconButton>
        </Tooltip>

        {selectedImg && (
          <Stack direction="row" spacing={0.5} sx={{ ml: 'auto', bgcolor: '#e3f2fd', p: 0.5, borderRadius: 1 }}>
            <Button size="small" variant="outlined" onClick={() => resizeImage('25%')}>25%</Button>
            <Button size="small" variant="outlined" onClick={() => resizeImage('50%')}>50%</Button>
            <Button size="small" variant="outlined" onClick={() => resizeImage('100%')}>100%</Button>
            <IconButton size="small" color="error" onClick={deleteImage}><Delete /></IconButton>
          </Stack>
        )}
      </Stack>

      <Box
        ref={editorRef}
        className="editor-body"
        sx={{
          height: height,
          maxHeight: '700px',
          overflowY: 'auto',
          p: 3,
          outline: 'none',
          fontSize: '16px',
          lineHeight: 1.6,
          bgcolor: '#fff',
          '&:focus': { bgcolor: '#fff' },
          '& img': { transition: 'outline 0.2s' },
          overflowWrap: 'break-word',
          wordBreak: 'break-all',
        }}
        onInput={handleInput}
        onClick={handleEditorClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        contentEditable="true"
        suppressContentEditableWarning={true}
        spellCheck={false}
      />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
    </Box>
    
  );
};

export default CommonEditor;