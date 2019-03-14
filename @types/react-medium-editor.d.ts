declare module 'react-medium-editor' {
  import React from 'react';

  interface ReactMediumEditorProps {
    // static defaultProps: {
    //   tag: string;
    // };
    // change(text: any): void;
    // forceUpdate(callback: any): void;
    className: string;
    name: string;
    text: string;
    id: string;
    onChange: (html: string) => void;
    options: {
      paste? : any;
      toolbar?: any;
    };
  }

  class ReactMediumEditor extends React.Component<ReactMediumEditorProps> {}

  export = ReactMediumEditor;
}

