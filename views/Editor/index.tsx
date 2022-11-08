import { memo, FC, useRef, useCallback } from 'react';
import { observer } from 'mobx-react';
import queryStore from '../../stores/QueryStore';
import { Button } from 'antd';
import MonacoEditor from "@monaco-editor/react";
import styles from "./index.module.scss";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import dataStore from '../../stores/DataStore';

const EXAMPLE_SHAPE_SEARCH = `[x.s=100,
  x.e=200,
  y.s=2,
  y.e=200]
[x.s=200,
  x.e=300,
  s.s=-30,
  s.e=30]`;

const Editor: FC<{}> = observer(() => {
  const textRef = useRef<string>(EXAMPLE_SHAPE_SEARCH);
  const onEditorChange = useCallback((value: any, event: any) => {
    textRef.current = value;
  }, []);
  const onEditorMount= useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    editor.setValue(textRef.current);
  }, []);
  const onGenerate = useCallback(() => {
    queryStore.shapeSearch(textRef.current);
  }, []);
  return (<div >
    <div className={styles["editor-container"]}>
    <MonacoEditor
      height={500}
      width={300}
      onChange={onEditorChange}
      onMount={onEditorMount}
      options={{
        scrollbar: {
          vertical: "hidden"
        },
        fontSize: 16,
        lineNumbers: "off",
      }}
    />
    </div>
    <Button disabled={!dataStore.selectedDatasetName || dataStore.status !== "idle"} type="primary" style={{margin: "0px 20px"}} onClick={onGenerate}>Generate</Button>
  </div>);
});

export default memo(Editor);