import styled from "styled-components";
import { auth, db } from "../firebase";
import { useEffect, useState } from "react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper=styled.div`
    display:flex;
    align-items:center;
    flex-direction:column;
    gap:20px;
`;

const AvatarImg=styled.img`
    width:100%;
`;

const AnonymousAvatarImg=styled.img`
    width:100%;
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

export default function UserTimeline() {
    const user=auth.currentUser;
    const avatar=useState(user?.photoURL);
    const [tweets,setTweets]=useState<ITweet[]>([]);
    
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
    
    return (
        <Wrapper>
            
            {avatar ? (
                <AvatarImg src={avatar} />
            ) : (
                <AnonymousAvatarImg src="/anonymous-avatar.svg" />
            )}
            <Name>
                {user?.displayName ?? "Anonymous"}
            </Name>
            <Tweets>
                {tweets.map(tweet=><Tweet key={tweet.id} {...tweet} />)}
            </Tweets>
        </Wrapper>
    );
}