import * as React from "react";

class Input extends React.Component<InputProps<InputPropsTypes>, {}> {
  
  
  constructor(props: any, context: any) {
    super(props, context);
    this.onChangeHandler = this.onChangeHandler.bind(this);
  }
  
  public render() {
    return (
      <input {...this.props}/>
    );
  }
  
  private onChangeHandler(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({value: event.target.value});
  }
  
}

type InputProps<T extends InputPropsTypes> =
  T extends "file" ? InputFileProps :
  
  T extends ("checkbox" | "radio") ? InputCheckedProps :
  
  T extends "email" ? (InputTextProps & InputMultipleProps & InputSpellcheckProps & InputPlaceholderProps) :
  T extends ("password" | "tel") ? (InputTextProps & InputPlaceholderProps) :
  T extends ("text" | "search" | "url") ? (InputTextProps & InputSpellcheckProps & InputPlaceholderProps) :
  
  T extends "number" ? (InputMinMaxProps & InputPlaceholderProps & InputValueAsNumberProps) :
  T extends "range" ? (InputMinMaxProps & InputValueAsNumberProps) :
  
  T extends ("date" | "datetime-local" | "month" | "time" | "week") ? (InputDateProps & InputStepProps & InputValueAsNumberProps) :
  InputBaseProps<"color" | "hidden">

type InputPropsTypes =
  "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "month" | "number" |
  "password" | "radio" | "range" | "search" | "tel" | "text" | "time" | "url" | "week"

interface InputBaseProps<T extends InputPropsTypes> extends React.HTMLAttributes<any>, React.DOMAttributes<any> {
  autocomplete?: boolean
  autofocus?: boolean
  disabled?: boolean
  form?: string
  list?: string
  name?: string
  readonly?: boolean
  required?: boolean
  tabindex?: number
  type?: T
  value?: any
}

interface InputCheckedProps extends InputBaseProps<"checkbox" | "radio"> {
  checked?: boolean
}

interface InputDateProps extends InputBaseProps<"date" | "datetime-local" | "month" | "time" | "week"> {
  valueAsDate?: boolean
}

interface InputFileProps extends InputBaseProps<"file">, InputMultipleProps {
  accept?: string
  capture?: string
  files?: string
}

interface InputMinMaxProps extends InputBaseProps<"number" | "range"> {
  max?: number
  min?: number
}

interface InputTextProps extends InputBaseProps<"text" | "search" | "url" | "password" | "tel" | "email"> {
  maxlength?: number,
  minlength?: number,
  pattern?: string,
  size?: number
}

interface InputMultipleProps {
  multiple?: boolean
}

interface InputSpellcheckProps {
  spellcheck?: boolean
}

interface InputPlaceholderProps {
  placeholder?: string
}

interface InputValueAsNumberProps {
  valueAsNumber?: boolean
}

interface InputStepProps {
  step?: number
}

export default Input;

