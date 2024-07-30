type TimeStampType = { seconds: number, nanoseconds: number }
export const convertTimeStampToDate = (timeStamp: TimeStampType): Date => {
    return timeStamp ? new Date(timeStamp.seconds * 1000) : new Date()
}
export const converToDateTime = (inputDate) => {
    const date = new Date(inputDate)
    return date.toLocaleString()
}