import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';
import Button from './components/Button/button'
import './index.scss'

ReactDOM.render(
  <div>
    <div className='demo-p'>
      <Button size='hg' btnType='primary'>大型按钮</Button>
      <Button size='lg' btnType='primary'>中型按钮</Button>
      <Button btnType='primary'>默认按钮</Button>
      <Button size='sm' btnType='primary'>小型按钮</Button>
      <Button size='mini' btnType='primary'>迷你按钮</Button>
    </div>
    <div className='demo-p'>
      <Button disabled btnType='primary'>主题色 禁用</Button>
      <Button btnType='success'>成功按钮</Button>
      <Button btnType='warning'>警告按钮</Button>
      <Button btnType='danger'>危险按钮</Button>
      <Button className="btn-my">默认按钮</Button>
    </div>
    <div className='demo-p'>
      <Button round disabled btnType='primary'>圆角 禁用</Button>
      <Button round btnType='success'>成功圆角</Button>
      <Button round btnType='warning'>警告圆角</Button>
      <Button round btnType='danger'>危险圆角</Button>
      <Button round className="btn-my">默认圆角</Button>
    </div>
    <div className='demo-p'>
      <Button size='lg' btnType='link' href='http://www.baidu.com'>www.baidu.com</Button>
      <Button size='lg' disabled btnType='link' href='http://www.baidu.com'>www.baidu.com</Button>
    </div>
  </div>,
  document.getElementById('root')
);
