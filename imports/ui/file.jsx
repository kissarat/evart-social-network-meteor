import React, {Component} from 'react'
import {Subscriber} from './widget'
import {Route} from 'react-router'

function upload(e) {
  const file = e.target.files[0]
  const xhr = new XMLHttpRequest()
  xhr.open('POST', `//${location.hostname}:9080/${file.name}`)
  xhr.setRequestHeader('authorization', 'Token ' + localStorage.getItem('Meteor.loginToken'))
  xhr.setRequestHeader('content-type', file.type)
  if (file.lastModifiedDate instanceof Date) {
    xhr.setRequestHeader('last-modified', file.lastModifiedDate.toGMTString())
  }
  xhr.send(file)
}

export class File extends Component {
  // componentWillMount() {
  //   Meteor.call('blog.get', params, (err, res) => {
  //     this.setState(res)
  //   })
  // }

  render() {
    return (
      <section>
        <input type="file" onChange={upload}/>
      </section>
    )
  }
}

export class Oembed extends Component {
  componentWillMount() {
    this.state = {}
  }

  onChange = (e) => {
    Meteor.call('oembed.get', {url: e.target.value}, (err, res) => {
      if (err) {
        console.error(err)
      }
      else {
        console.log(res)
        this.setState(res)
      }
    })
  }

  render() {
    return (
      <form>
        <div>
          <input size='100' onChange={this.onChange}/>
        </div>
        <div dangerouslySetInnerHTML={{__html: this.state.html}}/>
      </form>
    )
  }
}

export class Convert extends Subscriber {
  componentWillMount() {
    this.subscribe('convert')
  }

  render() {
    const rows = this.getSubscrition('convert').map(function (c) {
      const progress = Math.round(c.progress * 10)
      return (
        <tr key={c.id}>
          <td>{c.name}</td>
          <td>
            <progress value={progress} max="1000"/>
          </td>
          <td>{c.processed}</td>
          <td>{c.size}</td>
        </tr>
      )
    })
    return (
      <table>
        <tbody>{rows}</tbody>
      </table>
    )
  }
}

export const FileRoute =
  <Route>
    <Route path='upload' component={File}/>
    <Route path='oembed' component={Oembed}/>
    <Route path='convert' component={Convert}/>
  </Route>
