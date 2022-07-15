import React from "react";
import {
    Sidebar,
    Menu,
    Divider,
    Button,
    Modal,
    Icon,
    Label,
    Segment
} from "semantic-ui-react";
import { SliderPicker } from "react-color";
import { database } from "../../firebase";

class ColorPanel extends React.Component {
    state = {
        modal: false,
        primary: "",
        secondary: "",
        userColors:[],
        user:this.props.currentUser,
        userRef:database.ref('users')
    };
    componentDidMount() {
    if(this.state.user){
        this.addListener(this.state.user.id)
    }
    }
    addListener = userId => {
        let userColors = []
        this.state.userRef.child(userId+"/colors").on("child_added",snap =>{
            userColors.unshift(snap.val())
        })
        this.setState({
            userColors
        })
        console.log(userColors)
    }

    openModal = () => this.setState({ modal: true });

    closeModal = () => this.setState({ modal: false });
    handleChangePrimary = color => { this.setState({ primary: color.hex }) }
    handleChangeSecondaryy = color => { this.setState({ secondary: color.hex }) }
    handleSaveColor = () =>{
        if(this.state.primary && this.state.secondary){
            this.saveColors()
        }
    }
    saveColors = () => {
        let {primary,secondary} = this.state
        this.state.userRef.child(this.state.user.uid+"/colors").push().update({primary,secondary}).then(()=>{
            console.log("colors added")
            this.closeModal()
        }).catch(err => console.error(err))
    }

    render() {
        const { modal ,primary,secondary} = this.state;

        return (
            <Sidebar
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin"
            >
                <Divider />
                <Button icon="add" size="small" color="blue" onClick={this.openModal} />

                {/* Color Picker Modal */}
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose App Colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted>

                            <Label content="Primary Color" />
                            <SliderPicker color={primary}  onChange={this.handleChangePrimary} />
                        </Segment>
                        <Segment inverted>

                            <Label content="Secondary Color" />
                            <SliderPicker color={secondary} onChange={this.handleChangeSecondaryy} />
                        </Segment>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.handleSaveColor}>
                            <Icon name="checkmark" /> Save Colors
                        </Button>
                        <Button color="red" inverted onClick={this.closeModal}>
                            <Icon name="remove" /> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        );
    }
}

export default ColorPanel;