import React, {Component} from 'react'
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

export const FileRoute =
  <Route>
    <Route path='upload' component={File}/>
  </Route>
