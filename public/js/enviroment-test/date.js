function currentDate() {
    // current timestamp in milliseconds
    let ts = Date.now();

    let date_ob = new Date(ts);
    let date = date_ob.getDate();
    let month = date_ob.getMonth() + 1;
    let year = date_ob.getFullYear();

    // prints date & time in YYYY-MM-DD format
    const todayDate = year + "-" + month + "-" + date;
    return todayDate;
}

console.log(currentDate());

export { currentDate };
