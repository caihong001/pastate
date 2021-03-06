import * as React from 'react';

/** 
 * pastate 双向数据绑定输入框组件
 */
export default class Input extends React.PureComponent<{
    /** 文本值 */
    value: string | number
    /** 输入框类型, 默认为 text */
    type?: 
        "text" // 单行文本
        | "textarea" // 多行文本
        | "password" // 密码文本
        | "number" // 纯数字文本
    /** 
     * 在文本值更新前会被调用，可用于实现自定义字符串更新逻辑
     * @param newValue 将更新的新值
     * @param oldValue 原始值
     * @returns {string} 返回实际要更新的值
     */
    beforeChange?: (newValue?: string | number, oldValue?: string | number) => string | number
    /** 在绑定值更新后会被调用 */
    afterChange?: (newValue?: string | number) => void
    disabled?: boolean
    /** [实验特性] 指定是否开启输入法输入完成才更新 state 的模式，默认为关闭 */
    useComposedValue?: boolean
    /** 传递给输入框的 class 名 ( 用于指定 css 样式等 ) */
    className?: string
    /** 传递给输入框的 id 名 ( 用于指定 css 样式等 ) */
    id?: string
}, any> {

    constructor(props: any){
        super(props);
        this.innerValue = this.props.value + '';
        this.isComposing = false
    }

    private innerValue: string
    private isComposing: boolean

    handleChange = e => {
        this.innerValue = e.target.value;
        this.forceUpdate()

        if(this.isComposing == false){
            this.updateSourceValue()
        }
    }

    handleCompositionStart = () => {
        if(this.props.useComposedValue == true){
            this.isComposing = true
        }
    }

    handleCompositionEnd = () => {
        if(this.props.useComposedValue == true && this.isComposing){
            this.isComposing = false
            this.updateSourceValue()
        }
    }

    updateSourceValue = () => {
        let store = (this.props.value as any).__store__
        if(!store){
            throw new Error('[pastate] You can only give state node from this.props to pastate two-ways binding HOC component')
        }

        let valueTypeName: string = (Object.prototype.toString.call(this.props.value) as string).slice(8, -1);

        if(this.props.beforeChange){
            let oldValue = valueTypeName == 'Number' ? (+ this.props.value) : (this.props.value + '');
            let result = this.props.beforeChange(this.innerValue, oldValue)
            if(result != this.innerValue){
                this.innerValue = result + '';
                this.forceUpdate()
            }
        }
        store.set(this.props.value, valueTypeName == 'Number' ? (+this.innerValue) : (this.innerValue + ''))
        store.currentActionName = '[binding]'
        store.sync()
        this.props.afterChange && this.props.afterChange(this.innerValue)
    }

    componentWillReceiveProps(nextProps: any){
        this.innerValue = nextProps.value + ''
    }

    render() {
        let props = {
            onChange: this.handleChange,
            type: this.props.type || "text",
            onCompositionStart: this.handleCompositionStart,
            onCompositionEnd: this.handleCompositionEnd,
            value: this.innerValue,
            disabled: this.props.disabled,
            className: this.props.className,
            id: this.props.id
        };
        return this.props.type  == "textarea" ?
            <textarea {...props} />
            :
            <input {...props} /> 
    }
}