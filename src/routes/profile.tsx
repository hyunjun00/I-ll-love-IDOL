import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, updateDoc, where, doc } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper=styled.div`
    display:flex;
    align-items:center;
    flex-direction:column;
    gap:20px;
`;

const AvatarUpload=styled.label`
    width:80px;
    overflow:hidden;
    height:80px;
    border-radius:50%;
    background-color:#1d9bf0;
    cursor: pointer;
    display:flex;
    justify-content:center;
    align-items:center;
    svg {
        width:50px;
    }
`;

const AvatarImg=styled.img`
    width:100%;
`;

const AvatarInput=styled.input`
    display:none;
`;

const Name=styled.span`
    font-size:22px;
`;

const Tweets=styled.div`
    display:flex;
    width:100%;
    flex-direction:column;
    gap:10px;
`;

const AnonymousAvatarImg=styled.img`
    width:100%;
`;

const ChangeNameButton=styled.label`
    display:flex;
    flex-direction:column;
    svg {
        width:20px;
    }
`;

const ChangeNameTextArea=styled.textarea``;

const ChangeNameInput=styled.input`
    display:none;
`;

const ChangeOk=styled.div`
`;

const ChangeCancel=styled.div``;

export default function Profile() {
    const user=auth.currentUser;
    const [avatar,setAvatar]=useState(user?.photoURL);
    const [tweets,setTweets]=useState<ITweet[]>([]);
    const [changeOk,setChangeOk]=useState(false);
    const [newName,setNewName]=useState(user?.displayName ?? "");
    const onAvatarChange=async(e:React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if(!user) return;
        if(files && files.length===1) {
            const file=files[0];
            const locationRef=ref(storage,`avatar/${user?.uid}`);
            const result=await uploadBytes(locationRef,file);
            const avatarUrl=await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, {
                photoURL:avatarUrl,
            });
        }
    };
    const fetchTweets=async()=>{
        const tweetQuery=query(
            collection(db,"tweets"),
            where("userId","==",user?.uid),
            orderBy("createdAt","desc"),
            limit(25)
        );
        const snapshot=await getDocs(tweetQuery);
        const tweets=snapshot.docs.map(doc=> {
            const {tweet,createdAt,userId,username,photo}=doc.data();
            return {
                tweet,createdAt,userId,username,photo,id:doc.id,
            };
        });
        setTweets(tweets);
        console.log("1");
    };
    useEffect(()=>{
        fetchTweets();
    },[]);

    const onClickChangeName=()=>{
        setChangeOk(true);
    };
    const onChangeName=(e:React.ChangeEvent<HTMLTextAreaElement>)=>{
        setNewName(e.target.value);
    };
    const onChangeNameOk=async()=>{
        if(!user) return;
        if(user.displayName==newName)  return;
        await updateProfile(user,{
            displayName:newName,
        });
        
        try {
            const querySnapshot=await getDocs(collection(db,"tweets"));
            querySnapshot.forEach(tweet=>{
                const docRef=doc(db,"tweets",tweet.id)
                updateDoc(docRef, {
                    username:newName
                })
            })
        } catch(e) {
            console.log(e);
        }finally {
            setChangeOk(false);
        }
        console.log("2");
    };
    
    const onChangeNameCancel=()=>{
        setChangeOk(false);
        setNewName(newName);
    };
    return (
        <Wrapper>
            <AvatarUpload htmlFor="avatar">
            {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
            <AnonymousAvatarImg src="/anonymous-avatar.svg" />
        )}
            </AvatarUpload>
            <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
            {changeOk ? (
                <>
                    <ChangeNameTextArea required onChange={onChangeName} value={newName}/><ChangeOk onClick={onChangeNameOk}>✔</ChangeOk><ChangeCancel onClick={onChangeNameCancel}>❌</ChangeCancel>
                </>
            ): 
            <Name>
                {user?.displayName ?? "Anonymous"}
            </Name>}
            
            {/* {user?.uid===userId ? (
                <ChangeNameButton htmlFor="changeName">
                    <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
                    </svg>  
                </ChangeNameButton>
            ) :null}; */}

            <ChangeNameButton htmlFor="changeName">
                <svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="m2.695 14.762-1.262 3.155a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.886L17.5 5.501a2.121 2.121 0 0 0-3-3L3.58 13.419a4 4 0 0 0-.885 1.343Z" />
                </svg>  
            </ChangeNameButton>
            <ChangeNameInput id="changeName" onClick={onClickChangeName}/>
            <Tweets>
                {tweets.map(tweet=><Tweet key={tweet.id} {...tweet} />)}
            </Tweets>
        </Wrapper>
    );
}