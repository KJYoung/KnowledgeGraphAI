import { useDispatch } from "react-redux";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { coreActions, TabState } from "../store/slices/core";
// import { coreActions, selectCore, TabState } from "../store/slices/core";
import { NAV_MAIN_PAGE, NAV_NEW_PAGE, NAV_SUM_PAGE } from "../App";

const HeaderBtn = styled.div`
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    
    cursor: pointer;

    &:hover {
        border-bottom: 1px solid gray;
    }
    
    margin: 0px 10px 0px 10px;
    padding: 0px 15px 0px 15px;

    color: ${({ color }) => color};
`;

const Header = () => {
    // const coreState = useSelector(selectCore);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isActiveTab = (tab: TabState) => {
        // if(tab === coreState.selectedTab){
            return 'var(--hp-blue-active)';
        // }else{
            // return 'var(--hp-gray)';
        // }
    }
    const go_to_fn = (action: TabState, link: string) => {
        // dispatch(coreActions.setTab({selectedTab: action}));
        navigate(link);
    };

    return <HeaderRoot className="no-select">
    {/* DESKTOP HEADER */}
        <HeaderLeft onClick={() => dispatch(coreActions.setTab({selectedTab: TabState.MAIN}))}></HeaderLeft>
        <HeaderCenter>
            {/* <HeaderBtn color={isActiveTab(TabState.MAIN)} onClick={() => go_to_fn(TabState.MAIN, NAV_LOBBY_PAGE)}>
                <span>HOME</span>
            </HeaderBtn> */}
            <HeaderBtn color={isActiveTab(TabState.MAIN)} onClick={() => go_to_fn(TabState.MAIN, NAV_MAIN_PAGE)}>
                <span>HOME</span>
            </HeaderBtn>
            <HeaderBtn color={isActiveTab(TabState.SUMMARY)} onClick={() => go_to_fn(TabState.SUMMARY, NAV_SUM_PAGE)}>
                <span>GRAPH</span>
            </HeaderBtn>
            <HeaderBtn color={isActiveTab(TabState.NEW)} onClick={() => go_to_fn(TabState.NEW, NAV_NEW_PAGE)}>
                <span>KNOWLEDGE</span>
            </HeaderBtn>
        </HeaderCenter>
        
        <HeaderRight>
        </HeaderRight>
    </HeaderRoot>
};

const HeaderRoot = styled.div`
  width: 100%;
  height: 40px;
  background-color: var(--hp-lightblue);

  display: grid;
  grid-template-columns: 2fr 8fr 2fr;

  border-bottom: 1px solid var(--hp-gray);
`;
const HeaderLeft = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    
    cursor: pointer;
`;
const HeaderRight = styled.div`
    display: flex;
    flex-direction: column;
    > div {
        width: 100%;
        height: 50%;
        cursor: pointer;
        > span {
            margin-right: 10px;
            font-weight: 700;
            &.selected {
                color: gray;
                cursor: default;
            }
        }
    }
`;
const HeaderCenter = styled.div`
  width: 100%;
  height: 40px;

  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid var(--hp-gray);
`;

export default Header;