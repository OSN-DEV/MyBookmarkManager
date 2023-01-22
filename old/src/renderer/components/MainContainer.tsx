import SplitPane from "react-split-pane"
import CategoryList from './CategoryList'
  import ItemList from './ItemList'

const MainContainer = () => {
  return (
    <SplitPane split="vertical" minSize={200} defaultSize={200} maxSize={400}>
      <CategoryList categoryList={[]}/>
      <ItemList />
    </SplitPane >
    )
}

export default MainContainer

