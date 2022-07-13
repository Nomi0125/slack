import React from "react";
import { storage } from "../../firebase";
import uuidv4 from 'uuid/v4'
import { Segment, Button, Input } from "semantic-ui-react";

import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar/ProgressBar";

class MessageForm extends React.Component {
  state = {
    errors: [],
    message: "",
    modal: false,
    uploadState: "",
    loading: false,
    uploadTask: null,
    percentUploaded: 0,
    user: this.props.currentUser,
    channel: this.props.currentChannel,
    storageRef: storage.ref(),
  };

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  createMessage = (fileUrl = null) => {
    const message = {
      timestamp: new Date(),
      user: {
        id: this.state.user.uid,
        name: this.state.user.email,
        avatar: this.state.user.photoURL
      },
     
    };
    if(fileUrl !== null){
      message["image"] = fileUrl
    }
    else{
      message["content"] = this.state.message
    }
    return message;
  };

  sendMessage = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(this.props.currentChannel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch(err => {
          console.error(err);
          this.setState({
            loading: false,
            errors: this.state.errors.concat(err)
          });
        });
    } else {
      this.setState({
        errors: this.state.errors.concat({ message: "Add a message" })
      });
    }
  };
  uploadFile = (file,metaData) => {
   
    let pathToUpload = this.state.channel.id
    let ref = this.props.messagesRef;
    const filePath = `chat/public${uuidv4()}.jpg`

    this.setState({
      uploadState: "uploading",
      uploadTask: this.state.storageRef.child(filePath).put(file)
    },
      () => {
        this.state.uploadTask.on("state_changed", snap => {
          const percentUploaded = (snap.bytesTransferred / snap.totalBytes) * 100
          this.props.isProgressBarVisible(percentUploaded)
          this.setState({
            percentUploaded
          })
        },
          err => {
            console.error(err)
            this.setState({
              errors: this.state.errors.concat(err),
              uploadState: 'error',
              uploadTask: null
            })
          },
          () => {
            this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadUrl => {
              this.sendFileMessage(downloadUrl, ref, pathToUpload)
            }).catch(err => {
              console.error(err)
              this.setState({
                errors: this.state.errors.concat(err),
                uploadState: 'error',
                uploadTask: null
              })
            })
          }
        )
      })

  }
  sendFileMessage = (fileUrl,ref,pathToUpload, ) => {
    ref.child(pathToUpload).push().set(this.createMessage(fileUrl)).then(()=>{
      this.setState({uploadState:"done"})
    }).catch((e)=>{
      console.warn(e)
      this.setState({
        errors:this.state.errors.concat(e)
      })
    })

  }
  render() {
   
    const { errors, message, loading, modal,percentUploaded,uploadState } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          onChange={this.handleChange}
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon={"add"} />}
          labelPosition="left"
          className={
            errors.some(error => error.message.includes("message"))
              ? "error"
              : ""
          }
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
            icon="edit"
            color="orange"
            disabled={loading}
            content="Add Reply"
            labelPosition="left"
            onClick={this.sendMessage}
          />
          <Button
            color="teal"
            icon="cloud upload"
            labelPosition="right"
            content="Upload Media"
            onClick={this.openModal}
            disabled={uploadState === "uploading"}
          />
        </Button.Group>
          <FileModal modal={modal} closeModal={this.closeModal} uploadFile={this.uploadFile} />
          <ProgressBar 
          uploadState={uploadState}
          percentUploaded={percentUploaded}
          />

      </Segment>
    );
  }
}

export default MessageForm;
