import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import { isMobile } from 'react-device-detect';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import AddIcon from '@material-ui/icons/Add';
import { OpenInNew } from '@material-ui/icons';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import { ChromePicker } from 'react-color';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setBoard, deleteBoard, createPostit } from '../../actions/index';
import PostitList from './PostitList';
import PostitListMobile from './PostitListMobile';
import BottomAppToolbar from '../BottomAppToolbar/BottomAppToolbar';
import isFullscreenSupported from '../../lib/isFullscreenSupported';

const useStyles = makeStyles(() => ({
  errors: {
    color: 'red',
    width: '85%',
    textAlign: 'left',
    display: 'inline-block',
  },
  appBar: {
    top: 'auto',
    bottom: 0,
  },
  grow: {
    flexGrow: 1,
  },
}));

function Board({ mobile }) {
  const classes = useStyles();
  const boardRef = useRef();
  const { id } = useParams();
  const index = useSelector((state) => state.index);
  const board = useSelector((state) => state.boards[index]);
  const [isMobileDisplay, setIsMobileDisplay] = useState(mobile || isMobile);
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPostit, setNewPostit] = useState({
    type: 'postit',
    board: '0',
    title: '',
    text: '',
    visible: true,
    color: '#000000',
  });

  const [errors, setErrors] = useState({
    title: 'noError',
    text: 'noError',
    color: 'noError',
  });

  useEffect(() => {
    if (parseInt(id, 10) !== index) {
      dispatch(setBoard(parseInt(id, 10), { propagate: true }));
    }

    if (id !== newPostit.board + 1) {
      setNewPostit({ ...newPostit, board: parseInt(id, 10) + 1 });
    }

    setIsMobileDisplay(mobile || isMobile);
  }, [id]);

  const resetNewPostit = () => {
    setNewPostit({
      type: 'postit',
      board: parseInt(id, 10) + 1,
      title: '',
      text: '',
      visible: true,
      color: '#000000',
    });
  };

  const handleDeleteBoard = () => {
    dispatch(deleteBoard(board.id, { propagate: true }));
  };

  const handleCreatePostit = () => {
    const newErrors = {
      title: newPostit.title === '' ? 'Le titre ne doit pas être vide' : 'noError',
      text: newPostit.text === '' ? 'Le texte ne doit pas être vide' : 'noError',
      color: 'noError',
    };

    setErrors(newErrors);

    if (newErrors.title === 'noError' && newErrors.text === 'noError') {
      dispatch(createPostit(newPostit, { propagate: true }));
      setIsModalOpen(false);
      resetNewPostit();
    }
  };

  const handleCancelPostit = () => {
    setIsModalOpen(false);
    resetNewPostit();
  };

  const toggleFullscreen = () => {
    document.exitFullscreen().catch(() => {
      if (isFullscreenSupported()) {
        boardRef.current.requestFullscreen();
      }
    });
  };

  const visiblePostitArrayBuilder = () => {
    const newArray = [];

    board.postits.forEach((postit, i) => {
      if (postit.visible) {
        newArray.push({
          index: i,
          postit,
        });
      }
    });

    return newArray;
  };

  return (
    <div style={{ backgroundColor: 'white' }} ref={boardRef}>
      {
        board !== undefined
        && (
          <>
            {
              isMobileDisplay
                ? <PostitListMobile postits={visiblePostitArrayBuilder()} />
                : <PostitList postits={visiblePostitArrayBuilder()} />
            }
            <Dialog open={isModalOpen} onClose={() => { setIsModalOpen(false); }} aria-labelledby="form-dialog-title">
              <DialogTitle id="form-dialog-title">Créer un nouveau Postit</DialogTitle>
              <DialogContent>
                <Select
                  labelId="Type"
                  id="type"
                  value={newPostit.type}
                  onChange={(e) => { setNewPostit({ ...newPostit, type: e.target.value }); }}
                >
                  <MenuItem value="postit">Postit</MenuItem>
                </Select>
                <TextField
                  margin="dense"
                  id="title"
                  label="Titre"
                  type="text"
                  value={newPostit.title}
                  onChange={(e) => { setNewPostit({ ...newPostit, title: e.target.value }); }}
                  fullWidth
                />
                {
                  errors.title !== 'noError'
                  && <span className={classes.errors}>{errors.title}</span>
                }
                <TextField
                  margin="dense"
                  id="text"
                  label="Texte"
                  type="text"
                  value={newPostit.text}
                  onChange={(e) => { setNewPostit({ ...newPostit, text: e.target.value }); }}
                  fullWidth
                />
                {
                  errors.text !== 'noError'
                  && <span className={classes.errors}>{errors.text}</span>
                }
                <FormControlLabel
                  control={(
                    <Checkbox
                      color="primary"
                      checked={newPostit.visible}
                      onChange={(e) => {
                        setNewPostit({ ...newPostit, visible: e.target.checked });
                      }}
                      inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                  )}
                  label="Visible"
                />
                <ChromePicker
                  disableAlpha
                  name="color"
                  color={newPostit.color}
                  onChange={(color) => { setNewPostit({ ...newPostit, color: color.hex }); }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => { handleCancelPostit(); }} color="secondary">
                  Annuler
                </Button>
                <Button onClick={() => { handleCreatePostit(); }} color="primary">
                  Créer
                </Button>
              </DialogActions>
            </Dialog>
            <div className="btn-group">
              <Button variant="contained" color="primary" onClick={() => { setIsModalOpen(true); }} startIcon={<AddIcon />}>
                Ajouter un Postit
              </Button>
              <Button variant="contained" color="secondary" onClick={() => { handleDeleteBoard(); }} startIcon={<DeleteSweepIcon />}>
                Supprimer le Board
              </Button>
              {
                !isMobile
                && (
                  <Button variant="outlined" color="primary" onClick={toggleFullscreen}>
                    <OpenInNew />
                  </Button>
                )
              }
            </div>
          </>
        )
      }
      {
        isMobileDisplay
        && (
          <BottomAppToolbar />
        )
      }
    </div>
  );
}

export default Board;

Board.propTypes = {
  mobile: PropTypes.bool,
};

Board.defaultProps = {
  mobile: false,
};
