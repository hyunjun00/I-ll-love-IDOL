import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import EditTweets from "./edit-tweet";
// import { Link } from "react-router-dom";

const Wrapper=styled.div`
    display:grid;
    grid-template-columns:3fr 1fr;
    padding:20px;
    border:1px solid rgba(255,255,255,0.5);
    border-radius:15px;
`;

const Column=styled.div`
    display:flex;
    flex-direction:column;
`;

const Photo=styled.img`
    width:300px;
    height:300px;
    border-radius:15px;
    margin-top:10px;
`;

const Username=styled.span`
    font-weight:600;
    font-size:15px;
    margin-left:10px;
`;

const Payload=styled.p`
    margin:10px 0px;
    font-size:18px;
`;

const DeleteButton=styled.button`
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

const EditButton=styled.button`
    background-color:tomato;
    color:white;
    font-weight:600;
    border:0;
    font-size:12px;
    padding:5px 10px;
    text-transform:uppercase;
    border-radius:5px;
    cursor: pointer;
    margin-top:10px;
`;

const AnonymousAvatarImg=styled.img`
    width: 50px;
    height:50px;
    border-radius:50%;
`;

const AvatarImg=styled.img`
    width: 50px;
    height:50px;
    border-radius:50%;
`;

const UserInfo=styled.div`
    display:flex;
    flex-direction:flex-start;
    align-items:center;
`;

//  const Btn=styled.button``;

export default function Tweet(tweetProps:ITweet) {
    const [edit,setEdit]=useState(false);
    const {username,photo,tweet,userId,id}=tweetProps;
    //const modalBackground=useRef();
    const user=auth.currentUser;
    const [avatar,setAvatar]=useState<string|null>(null);
    
    const onDelete=async()=>{
        const ok=confirm("Are you sure you want to delete this tweet?");
        if(!ok || user?.uid!==userId) return;
        try {
            await deleteDoc(doc(db,"tweets",id));
            if(photo) {
                const photoRef=ref(storage,`tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch(e) {
            console.log(e);
        } finally {
            //
        }
    };
    const onEdit=async()=> {
        setEdit(true);
    };
    const onCloseEdit=async()=> {
        setEdit(false);
    };

    //Tweets 사용자 아바타
    const fetchAvatarUrl=async(userId:string)=>{
        try{
            const userRef=doc(db,"tweets",userId);
            const userDoc=await getDoc(userRef);
            const userDataID=userDoc.id;
            const avatarRef=ref(storage,`avatar/${userDataID}`);

            return await getDownloadURL(avatarRef);
        } catch(e) {
            console.log(e);
        }
    };

    useEffect(()=>{
        const fetchTweetAvatar=async()=>{
            if(userId) {
                const avatarUrl = await fetchAvatarUrl(userId);
				setAvatar(avatarUrl);
            } else {
                console.log("userId is undefined or null");
            }
        };

        fetchTweetAvatar();
    },[userId]);
    
    // const click=()=>{
    //     console.log(`${user?.uid} ${userId} `);
    // };
    /*
    const exitModal=async(e:MouseEvent)=>{
        if(e.target===modalBackground.current) {
            setEdit(false);
        }
    }
    */

    return (
        <Wrapper>
            <Column>
                {/* <>
                    {user?.uid===userId ? (
                        <Link to={`/profile/${userId}`}>
                            {avatar ? (
                                <AvatarImg src={avatar}/>
                            ) : (
                                <AnonymousAvatarImg src="/anonymous-avatar.svg" />
                            )}
                        </Link>
                    ):(
                        <Link to="/user-timeline" tweet={tweetProps}> 
                        <Link to={{
                            pathname:"/user-timeline",
                            state:{userId},
                             }}
                        >
                        <Link to={`/user-timeline/${userId}`}>
                        <Link to="/user-timeline" state={{userId:`${userId}`}} onClick={click}>
                            {avatar ? (
                                <AvatarImg src={avatar} />
                            ) : (
                                <AnonymousAvatarImg src="/anonymous-avatar.svg" />
                            )}
                        </Link>
                    )}
                </> */}
                <UserInfo>
                    {avatar ? (
                        <AvatarImg src={avatar} />
                    ) : (
                        <AnonymousAvatarImg src="/anonymous-avatar.svg" />
                    )}
                    <Username>{username}</Username>
                </UserInfo>
                {photo ? (
                    <Photo src={photo} />
                ):null}
                <Payload>{tweet}</Payload>
            </Column>
            <Column>
            {user?.uid===userId ? (
                    <>
                        <DeleteButton onClick={onDelete}>Delete</DeleteButton> 
                        <EditButton onClick={onEdit}>Edit</EditButton>
                    </>
                ):null}
            </Column>
            {edit ? (
                /*<EditTweets ref={modalBackground}  onClick={exitModal} onClose={closeEdit} tweet={tweetProps} />*/
                <EditTweets onClose={onCloseEdit} tweet={tweetProps} />
            ):null}
        </Wrapper>
    );
}