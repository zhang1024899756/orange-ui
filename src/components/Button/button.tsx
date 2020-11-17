import React, { FC, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react'
import classNames from 'classnames'

export type ButtonSize = 'hg' | 'lg' | 'sm' | 'mini'
export type ButtonType = 'primary' | 'default' | 'success' | 'warning' | 'danger' | 'link'

interface BaseButtonProps {
  className?: string;
  /**设置 Button 的禁用 */
  disabled?: boolean;
  /**设置 Button 的尺寸 */
  size?: ButtonSize;
  /** 圆角 **/ 
  round?: boolean;
  /**设置 Button 的类型 */
  btnType?: ButtonType;
  children: React.ReactNode;
  href?: string;
}
type NativeButtonProps = BaseButtonProps & ButtonHTMLAttributes<HTMLElement>
type AnchorButtonProps = BaseButtonProps & AnchorHTMLAttributes<HTMLElement>
// Partial 设置可选
export type ButtonProps = Partial<NativeButtonProps & AnchorButtonProps>


export const Button: FC<ButtonProps> = (props) => {
  const { btnType, className, disabled, size, round, children, href, ...restProps } = props

  const classes = classNames('btn', className, {
    [`btn-${btnType}`]: btnType,
    [`btn-${size}`]: size,
    'disabled': (btnType === 'link') && disabled,
    'round': round
  })
  if (btnType === 'link' && href) {
    return (<a className={classes} href={href} {...restProps}>{children}</a>)
  } else {
    return (
      <button className={classes} disabled={disabled} {...restProps}>
        {children}
      </button>
    )
  }
}


export default Button