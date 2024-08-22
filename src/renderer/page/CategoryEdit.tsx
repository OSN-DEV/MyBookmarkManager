export const CategoryEdit = () => {
    const handleClick = () => {
        console.log('whey!!!!!!!!!!!!')
        window.categoryApi.ping2()
    }
    return(
        <form>
            <button type="button" onClick={handleClick}>Ping</button>
        </form>
    )
}