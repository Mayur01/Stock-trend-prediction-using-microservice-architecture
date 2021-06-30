setTotalAmount();
function setTotalAmount(){
    let totalInvestedAmount=0;
    const $tdElement = $("#stocksTable tbody tr td:nth-child(5)").toArray();
    $tdElement.forEach(element => {
        totalInvestedAmount += (Number((element.innerHTML.replace(/[^0-9.]/g,""))))
    });
    $("#totalInvestedAmount").html(`Investing: $${totalInvestedAmount.toFixed(4)}`);
}