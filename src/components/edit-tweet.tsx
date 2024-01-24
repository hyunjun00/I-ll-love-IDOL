import React, { useEffect, useRef, useState } from "react";
import { ITweet } from "./timeline";
import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

export interface EditTweetProps {
    onClose:()=>void;
    tweet:ITweet;
} 

const Wrapper=styled.dialog`
  padding:0px;
  border-radius:15px;
  &::backdrop {
    background-color:rgba(0,0,0,0.7);
  }
`;

const Form=styled.form`
  font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  display:grid;
  grid-template-columns:3fr 1fr;
  padding:20px;
  border: 1px solid rgba(255,255,255,0.5);
  border-radius:15px;
`;

const AvatarImg=styled.img`
  width:80px;
  overflow:hidden;
  height:80px;
  border-radius:50%;
  background-color:#1d9bf0;
  display:flex;
  justify-content:left;
  svg {
      width:50px;
  }
`;

const AnonymousAvatarImg=styled.img`
  width:80px;
  overflow:hidden;
  height:80px;
  border-radius:50%;
  background-color:#1d9bf0;
  display:flex;
  justify-content:left;
  svg {
      width:50px;
  }
`;

const TextArea=styled.textarea``;

const AttachFileButton=styled.label``;

const AttachFileInput=styled.input`
  display:none;
`;

const PhotoImg=styled.img`
  width:200px;
  height:200px;
  border-radius:20px;
`;

const SubmitButton=styled.input`
  background-color:tomato;
  color:white;
  font-weight:600;
  border:0;
  font-size:12px;
  padding:5px 10px;
  text-transform:uppercase;
  border-radius:5px;
  cursor: pointer;
`;

const CancelButton=styled.input`
  background-color:tomato;
    color:white;
    font-weight:600;
    border:0;
    font-size:12px;
    padding:5px 10px;
    text-transform:uppercase;
    border-radius:5px;
    cursor: pointer;
`;

const DeleteImg=styled.div``;

export default function EditTweets({onClose,tweet}:EditTweetProps) {
    const user=auth.currentUser;
    const [isLoading,setLoading]=useState(false);
    const [newTweet,setNewTweet]=useState("");
    const [newFile,setNewFile]=useState<File|null>(null);
    const [deleteFile,setDeleteFile]=useState(false);
    const avatar=user?.photoURL;
    const dialogRef=useRef<HTMLDialogElement>(null);

    const onEditTweet=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
      setNewTweet(e.target.value);
    };
    const onEditFile=(e:React.ChangeEvent<HTMLInputElement>)=>{
      const {files}=e.target;
      if(files&&files.length===1) {
        setNewFile(files[0]);
      }
    };
    const onDeleteFile=()=>{
      setDeleteFile(true);
      setNewFile(null);
    }
    const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=> {
      e.preventDefault();
      const user=auth.currentUser;
      if(!user||isLoading||newTweet===""||newTweet.length>180) return;

      try {
        setLoading(true);
        const tweetRef=doc(db,"tweets",tweet.id);
        await updateDoc(tweetRef,{
          tweet:newTweet,
          updateDoc:Date.now(),
        });
        if(deleteFile && tweet.photo) {
          const OriginRef=ref(storage,`tweets/${user.uid}/${tweet.id}`);
          await deleteObject(OriginRef);
          await updateDoc(tweetRef, {
            photo:null,
            updateDoc:Date.now(),
          });
        }
        if(newFile) {
        const locationRef=ref(storage,`tweets/${user.uid}/${tweet.id}`);
        const result=await uploadBytes(locationRef,newFile);
        const url=await getDownloadURL(result.ref);
        await updateDoc(tweetRef, {
            photo:url,
            updateDoc:Date.now(),
        });

        //업데이트 된 내용 서버에서 가져오기
        const updatedTweetSnapshot=await getDoc(tweetRef);
        const updatedTweetData=updatedTweetSnapshot.data();

        //업데이트된 트윗 내용을 상태에 업뎃
        setNewTweet(updatedTweetData?.tweet);
      }
      } catch(e) {
        console.log(e);
      } finally {
        setLoading(false);
        onClose();
      }
    }
    const onCancel=()=>{
      onClose();
    };

    useEffect(() => {
      setNewTweet(tweet.tweet);
      dialogRef.current?.showModal();
    }, []);

    const previewImg=deleteFile ? null : newFile ? URL.createObjectURL(newFile) : tweet.photo;

    return (
      <Wrapper ref={dialogRef}>
        <Form onSubmit={onSubmit}>
          {avatar ? (
            <AvatarImg src={avatar} />
          ) : (
            <AnonymousAvatarImg src="/anonymous-avatar.svg" />
          )}
          <TextArea required rows={5} maxLength={180} onChange={onEditTweet} value={newTweet}></TextArea>
          {previewImg ? (<DeleteImg onClick={onDeleteFile}>❌</DeleteImg>):null}
          <AttachFileButton htmlFor={`newFile${tweet.id}`}>{previewImg ? (<PhotoImg src={previewImg} />):(<PhotoImg src="/Photo-black.svg" />)}</AttachFileButton>
          <AttachFileInput onChange={onEditFile} type="file" id={`newFile${tweet.id}`} accept="image/*"/>
          <SubmitButton type="submit" value={isLoading ? "Posting..." : "Post Tweet"}/>
          {isLoading ? null : (<CancelButton type="button" onClick={onCancel} value="Cancel" />)}
        </Form>
      </Wrapper>
    );
}