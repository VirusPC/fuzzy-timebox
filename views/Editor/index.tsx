import { memo, FC, useRef, useCallback } from 'react';
import { observer } from 'mobx-react';
import queryStore from '../../stores/QueryStore';
import { Button } from 'antd';
import MonacoEditor from "@monaco-editor/react";
import styles from "./index.module.scss";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';


const Editor: FC<{}> = observer(() => {
  const textRef = useRef<string>("");
  const onEditorChange = useCallback((value: any, event: any) => {
    textRef.current = value;
  }, []);
  const onEditorMount= useCallback((editor: monaco.editor.IStandaloneCodeEditor, monaco: any) => {
  }, []);
  const onGenerate = useCallback(() => {
    console.log("on generate");
    queryStore.shapeSearch(textRef.current);
    // const { container } = queryStore
    // container?.removeAllComponents();
    // parseShapeSearch();
  }, []);
  return (<div >
    <div className={styles["editor-container"]}>
    <MonacoEditor
      height={500}
      width={300}
      // defaultLanguage={""}
      onChange={onEditorChange}
      onMount={onEditorMount}
      options={{
        scrollbar: {
          vertical: "hidden"
        },
        fontSize: 16,
        lineNumbers: "off"
      }}
    />
    </div>
    <Button type="primary" style={{margin: "0px 20px"}} onClick={onGenerate}>Generate</Button>
  </div>);
});

export default memo(Editor);