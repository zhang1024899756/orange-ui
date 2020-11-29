import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.scss';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import Button from './components/Button/button'
import Icon from './components/Icon/icon'
import './index.scss'

library.add(fas)

ReactDOM.render(
  <div>
    <h4>按钮</h4>
    <div className='demo-p'>
      <Button size='hg' btnType='primary'>大型按钮</Button>
      <Button size='lg' btnType='primary'>中型按钮</Button>
      <Button btnType='primary'>默认按钮</Button>
      <Button size='sm' btnType='primary'>小型按钮</Button>
      <Button size='mini' btnType='primary'>迷你按钮</Button>
    </div>
    <div className='demo-p'>
      <Button loading>加载按钮</Button>
      <Button loading btnType='primary'>加载按钮</Button>
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
    <h4>图标</h4>
    <div className='demo-p'>
      <Icon icon="microphone-alt" theme="secondary" size="3x"></Icon>
      <Icon icon="meh-rolling-eyes" theme="success" size="3x"></Icon>
      <Icon icon="level-up-alt" theme="dark" size="3x"></Icon>
      <Icon icon="coffee" theme="danger" size="3x"></Icon>
      <Icon icon="jedi" theme="success" size="3x"></Icon>
      <Icon icon="keyboard" size="3x"></Icon>
      <Icon icon="kiss-wink-heart" theme="armygreen" size="3x"></Icon>
      <Icon icon="landmark" theme="danger" size="3x"></Icon>
    </div>
  </div>,
  document.getElementById('root')
);
