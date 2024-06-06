// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
// import IfcViewer from './IfcViewer';
import { IfcViewerAPI } from 'web-ifc-viewer';
import { IfcContainer } from './IfcContainer';
import { Color } from 'three';
import { Input, TextField } from '@mui/material';

export default function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false);
  const ifcContainerRef = useRef<HTMLDivElement | null>(null);
  const [ifcViewer, setIfcViewer] = useState<IfcViewerAPI | null>(null);
  const [ifcLoadingErrorMessage, setIfcLoadingErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (ifcContainerRef.current) {
      const container = ifcContainerRef.current;
      console.log('container', container);
      const viewer = new IfcViewerAPI({
        container,
        backgroundColor: new Color(0xffffff),
      });
      console.log('ifcViewer', viewer);
      viewer.axes.setAxes();
      viewer.grid.setGrid();
      viewer.IFC.loader.ifcManager.applyWebIfcConfig({
        COORDINATE_TO_ORIGIN: true,
        USE_FAST_BOOLS: false,
      });
      setIfcViewer(viewer);
      console.log('set ifcViewer');
    }
  }, []);

  const ifcOnLoad = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && ifcViewer) {
      setIfcLoadingErrorMessage('');
      setLoading(true);
      console.log('loading file');

      try {
        const model = await ifcViewer.IFC.loadIfc(file, true);
        console.log('build model');
        await ifcViewer.shadowDropper.renderShadow(model.modelID);
        console.log('render shadow');
        setIsSnackbarOpen(true);
      } catch (error) {
        ifcOnLoadError(error);
      } finally {
        setLoading(false);
      }

      console.log('done');
      console.log(ifcViewer);
    }
  };

  const ifcOnLoadError = (err: any) => {
    console.error('IFC Loading Error:', err);
    setIfcLoadingErrorMessage(`Error loading IFC: ${err.message || err}`);
  };

  return (
    <div className="App" style={{ flexGrow: 1 }}>
       <TextField
          type="file"
          onChange={ifcOnLoad}
          inputProps={{ 'aria-label': 'Upload IFC file', accept: '.ifc' }}
          variant="outlined"
        />
      <IfcContainer ref={ifcContainerRef} viewer={ifcViewer} />
      {loading && <div>Loading...</div>}
      {ifcLoadingErrorMessage && <div>Error: {ifcLoadingErrorMessage}</div>}
      {isSnackbarOpen && <div>IFC file loaded successfully!</div>}
    </div>
  );
};

