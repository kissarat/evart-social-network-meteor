import React, {Component} from 'react'
import _ from 'underscore'
import {bucketFile, thumb} from '/imports/ui/common/helpers'
import Dropzone from 'react-dropzone'

export class Subscriber extends Component {
  subscribe(name, state = {}) {
    if (!this.subscription) {
      this.subscription = {}
    }
    let subscription = this.subscription[name]
    if (subscription instanceof PgSubscription) {
      subscription.change(state)
    }
    else {
      subscription = new PgSubscription(name, state)
      this.subscription[name] = subscription
    }
    subscription.addEventListener('updated', () => this.setState({
      [name]: state,
      busy: false
    }))
    return subscription
  }

  unsubscribe(name) {
    const old = this.getSubscription(name, false)
    if (old) {
      old.stop()
    }
    delete this.subscription[name]
  }

  getSubscription(name, defaultValue = []) {
    if (!this.subscription) {
      this.subscription = {}
    }
    return this.subscription[name] || defaultValue
  }

  componentWillUnmount() {
    if (this.subscription) {
      for (const name in this.subscription) {
        this.unsubscribe(name)
      }
    }
  }
}

export class ScrollArea extends Component {
  scroll(element) {
    // $(element).mCustomScrollbar({
    //   theme: 'minimal-dark',
    //   axis: 'y',
    //   scrollInertia: 400,
    //   autoDraggerLength: false,
    //   mouseWheel: {
    //     scrollAmount: 200
    //   }
    // })
    if (element) {
      element.classList.add('scroll')
    }
  }

  render() {
    return <ul ref={this.scroll}>{this.props.children}</ul>
  }
}

export class InputGroup extends Component {
  render() {
    const message = this.props.message ? <span className="help-block">{this.props.message}</span> : ''
    const label = this.props.label ? <label>{this.props.label}</label> : ''
    return <div className={'form-group' + (message ? ' has-error' : '')}>
      {label}
      <div className="control-container">
        {this.props.children}
        {message}
      </div>
    </div>
  }
}

export const Avatar = ({avatar, type, className, name, big}) => {
  if (avatar) {
    avatar = big ? bucketFile(avatar) : thumb(avatar)
  }
  else {
    if (['user', 'group', 'chat'].indexOf(type) < 0) {
      type = 'user'
    }
    avatar = `/images/${type}.png`
  }
  if (!className) {
    className = 'avatar circle'
  }
  if (className.indexOf('back') >= 0) {
    return <div style={{backgroundImage: `url("${avatar}")`}} className={className} title={name}/>
  }
  else {
    return <img src={avatar} alt={name} title={name} className={className}/>
  }
}

export const Busy = () => <div className="busy-animation"></div>

export class ImageDropzone extends Component {
  componentWillMount() {
    this.state = {}
  }

  onDrop = (files, e) => {
    this.setState({busy: true})
    this.props.onDrop(files, e).then(() => {this.setState({busy: false})})
  }

  render() {
    const attrs = _.pick(this.props, 'className')
    attrs.id = this.props.imageProperty
    const imageUrl = thumb(this.props.imageId)
    attrs.style = this.props.imageId ? {
      background: `url("${imageUrl}") no-repeat center`,
      backgroundSize: 'cover'
    } : {}
    attrs.onDrop = this.onDrop
    if (!this.state.busy && 'manage' === this.props.relation) {
      attrs.accept = 'image/*'
      attrs.className = (attrs.className ? attrs.className + ' ' : '') + 'dropzone image'
      return <Dropzone {...attrs}>{this.props.children}</Dropzone>
    }
    else {
      return <div {...attrs}>{this.state.busy ? <Busy/> : this.props.children}</div>
    }
  }
}

export class Search extends Component {
  componentWillMount() {
    this.state = {}
  }

  search = _.debounce((string) => this.props.search(string), 300)

  onChange = (e) => {
    const string = (e.target.value || '').trim().replace(/\s+/g, ' ')
    this.search(string)
    this.setState({value: string})
  }

  render() {
    return <div className="search">
      <button type="button">
        <span className="icon icon-search"/>
      </button>
      <input
        type="search"
        value={this.state.value || ''}
        placeholder={this.props.label || ''}
        onChange={this.onChange}
      />
      {this.props.children}
    </div>
  }
}
