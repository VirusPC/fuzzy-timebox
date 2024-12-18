import { memo, FC, useRef, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Button } from 'antd';
import MonacoEditor from "@monaco-editor/react";
import styles from "./index.module.scss";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import dataStore from '../../../stores/DataStore';
import queryStore from '../../../stores/QueryStore';

const EXAMPLE_SHAPE_SEARCH = 
`[
  x.s=312,
  x.e=414,
  y.s=417,
  y.e=496,
  p=0.69
]
[
  x.s=569,
  x.e=618,
  s.s=5.944835808891588,
  s.e=80.32126058049612,
  p=0.87
]
`
// [
//   x.s=507,
//   x.e=673,
//   y.s=276,
//   y.e=384,
//   p=0.5
// ]

// `[
//   x.s=789,
//   x.e=829,
//   y.s=20,
//   y.e=40,
//   p=0.5
// ]
// [
//   x.s=200,
//   x.e=300,
//   s.s=-30,
//   s.e=30
// ]`;

const Editor: FC<{}> = observer(() => {
  const textRef = useRef<string>(EXAMPLE_SHAPE_SEARCH);
  const onEditorChange = useCallback((value: any, event: any) => {
    textRef.current = value;
  }, []);
  const onEditorMount= useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
    editor.setValue(textRef.current);
    queryStore.editor = editor;
  }, []);
  const onGenerate = useCallback(() => {
    queryStore.executeShapeSearch(textRef.current);
  }, []);
  return (<div >
    <div className={styles["editor-container"]}>
    <MonacoEditor
      language='javascript'
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
    <Button className={styles["generate-btn"]} disabled={!dataStore.selectedDatasetName} type="primary" onClick={onGenerate}>Generate</Button>
  </div>);
});

export default memo(Editor);