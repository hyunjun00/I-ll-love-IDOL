import { collection, getDocs, limit, onSnapshot, orderBy, query, startAfter } from "firebase/firestore";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
    id:string;
    photo?:string;
    tweet:string;
    userId:string;
    username:string;
    createdAt:number;
}

const Wrapper=styled.div`
    display:flex;
    gap:10px;
    flex-direction:column;
    overflow-y:scroll;
`;

export default function Timeline() {
    const [tweets,setTweet]=useState<ITweet[]>([]);
    const [isLoading,setLoading]=useState(false);

    const fetchTweetsAfter=async()=> {
        if(isLoading) return;

        try {
            setLoading(true);
            const tweetsQuery=query(
                collection(db,"tweets"),
                orderBy("createdAt","desc"),
                limit(5),
                startAfter(tweets[tweets.length-1].createdAt)
            );

            const snapshot=await getDocs(tweetsQuery);
            const tweetsCopy=Array.from(tweets);
            snapshot.docs.map((doc)=> {
                const {tweet,createdAt,userId,username,photo}=doc.data();
                tweetsCopy.push({
                    tweet: tweet,
                    createdAt: createdAt,
                    userId: userId,
                    username: username,
                    photo: photo,
                    id:doc.id,
                });
             return {
                    tweet,createdAt,userId,username,photo,id:doc.id,
                };
            });
         setTweet(tweetsCopy)
        } catch(e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }
    
    const handleScroll=(e:React.UIEvent)=>{
        const target=e.target as HTMLElement;
        const bottomPos=target.clientHeight+target.scrollTop;
        if(target.scrollHeight<=bottomPos) {
            fetchTweetsAfter();
        }
    }

    useEffect(()=> {
        let unsubscribe:Unsubscribe|null=null;
        const fetchTweets=async()=> {
            const tweetsQuery=query(
                collection(db,"tweets"),
                orderBy("createdAt","desc"),
                limit(10),
            );
            /*
            const snapshot=await getDocs(tweetsQuery);
            const tweets=snapshot.docs.map((doc)=>{
                const {tweet,createdAt,userId,username,photo}=doc.data();
                return {
                    tweet,createdAt,userId,username,photo,id:doc.id,
                };
            });*/
            //사진 여러 장 등록에 map 함수 써보기
            unsubscribe=await onSnapshot(tweetsQuery,(snapshot)=>{
                const tweets=snapshot.docs.map((doc)=> {
                    const {tweet,createdAt,userId,username,photo}=doc.data();
                    return {
                        tweet,createdAt,userId,username,photo,id:doc.id,
                    };
                });
                setTweet(tweets);
            });
        };
        fetchTweets();
        return() => {
            unsubscribe && unsubscribe();
        }
        
    },[]);
    return (
        <Wrapper onScroll={handleScroll}>
            {tweets.map(tweet => <Tweet key={tweet.id} {...tweet} />)}
        </Wrapper>
    );
}