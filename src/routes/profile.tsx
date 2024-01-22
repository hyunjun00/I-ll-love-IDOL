import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
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

export default function Profile() {
    const user=auth.currentUser;
    const [avatar,setAvatar]=useState(user?.photoURL);
    const [tweets,setTweets]=useState<ITweet[]>([]);
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
    };
    useEffect(()=>{
        fetchTweets();
    },[]);
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
            <Name>
                {user?.displayName ?? "Anonymous"}
            </Name>
            <Tweets>
                {tweets.map(tweet=><Tweet key={tweet.id} {...tweet} />)}
            </Tweets>
        </Wrapper>
    );
}