import styled from "styled-components";

export const Main=styled.div`
    height:100%;
    display:flex;
    flex-direction:flex-start;
`;
//출처 <a href="https://kr.freepik.com/free-vector/k-pop-music-design_9470993.htm#page=3&query=%EC%BC%80%EC%9D%B4%ED%8C%9D&position=22&from_view=keyword&track=sph&uuid=ca4a1849-8ec1-400b-9c16-d496f21f29e3">Freepik</a>
export const SignImg=styled.img`
    width:700px;
    height:700px;
    margin-top:50px;
`;

export const Wrapper=styled.div`
    height:100%;
    display:flex;
    flex-direction:column;
    align-items:center;
    width:320px;
    padding:200px 0px;
    margin-right:200px;
`;

export const Title=styled.h1`
    font-size:42px;
`;

export const Form=styled.form`
    margin-top:50px;
    margin-bottom:10px;
    display:flex;
    flex-direction:column;
    gap:10px;
    width:100%;
`;
export const Input=styled.input`
    padding:10px 20px;
    border-radius: 50px;
    border:none;
    width:100%;
    font-size:16px;
    &[type="submit"] {
        cursor: pointer;
        &:hover {
            opacity:0.8;
        }
    }
`;

export const Error=styled.span`
    font-weight:600;
    color:tomato;
`;

export const Swither=styled.span`
    margin-top:20px;
    a {
        color: #1d9bf0;
    }
`;
