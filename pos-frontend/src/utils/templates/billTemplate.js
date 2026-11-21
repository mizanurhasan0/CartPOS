import { formatDate, formatTimeWithAMPM } from "../helpers/dateFormatter";

export const billTemplateA4= ({currency, payMethod, customerName, customerPhone, products, subTotal, vat, vatAmount, discount, netAmount, storeName, storeAddress, storePhone, invoiceId, cashier, flatDiscount, date})=> ` 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style> p {margin: 0px;} </style>
</head>
<body>
    <main style="width: 90%; margin: auto;  padding: 10px;">
        <div style="display: flex; align-items: center; justify-content: center; padding-top: 30px;">
            <img src="data:image/svg+xml,%3Csvg%20width%3D%2264%22%20height%3D%2264%22%20viewBox%3D%220%200%20120%20120%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M16%2030H32L42%2078H88L98%2044H36%22%20fill%3D%22none%22%20stroke%3D%22%23023535%22%20stroke-width%3D%227%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M52%2058L62%2068L80%2050%22%20fill%3D%22none%22%20stroke%3D%22%230CABA8%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2294%22%20r%3D%228%22%20fill%3D%22%23023535%22/%3E%3Ccircle%20cx%3D%2284%22%20cy%3D%2294%22%20r%3D%228%22%20fill%3D%22%23FFC96B%22/%3E%3C/svg%3E" width="64" height="64" alt="CartPOS">

        </div>
<div style="text-align: center;">
    <p style="color: #015958; font-size: 14px; font-weight: 400; margin-top: 20px;">${storeName || 'Store Name'}</p>
    <p style= "font-size: 12px;"> ${storeAddress || 'Store Address'}</p>
    <p style="font-size: 12px;">Phone: ${storePhone || 'Store phone'}</p></div>

    <p style=" font-size: 16px; font-weight: 600; text-align: center; margin-top: 20px; margin-bottom:20px;">Sales Receipt</p>
<div style="font-size: 10px;  font-weight: 600; display: flex; justify-content: space-between;">
    <div style="flex: 1;">
        <p style="margin: 0;">Date: ${formatDate(date)}</p>
        <p style="margin: 0;">ID: ${invoiceId}</p>
    </div>
    <div style="text-align: right; flex: 1;">
        <p style="margin: 0;">Time: ${formatTimeWithAMPM(date)}</p>
        <p style="margin: 0;">Cashier: ${cashier}</p>
    </div>
</div>
<div style="font-size: 10px;  font-weight: 600; padding-top: 20px;">
    <p style="margin: 0;">Customer Name: ${customerName || ''}</p>
    <p style="margin: 0;">Customer Phone: ${customerPhone || ''}</p>
</div>
<p></p>

<table style=" border-collapse: collapse; width: 100%; font-size: 8px">
    <thead>
        <tr>
            <th style="border-left: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: left; padding: 8px;">SL No.</th>
            <th style="border-top: 1px solid #000; border-bottom: 1px solid #000;   padding: 8px;text-align: left;">Item / Code</th>
            <th style="border-top: 1px solid #000; border-bottom: 1px solid #000;  padding: 8px; text-align: left;">Price</th>
            <th style="border-top: 1px solid #000; border-bottom: 1px solid #000;  padding: 8px;text-align: left;">Qty</th>
            <th style="border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: left; padding: 8px;">Total</th>
        </tr>
    </thead>
    <tbody >
        ${products.map((item, index)=>('<tr> <td style="text-align: left; border-bottom: 1px dashed;padding: 8px">'+(index+1) + '</td><td style="text-align: left;border-bottom: 1px dashed;">'+item?.title?.slice(0, 40)+'</td><td style="text-align: left;border-bottom: 1px dashed;">'+ currency?.symbol + ' '+ item?.price+ '</td><td style="text-align: left;border-bottom: 1px dashed;">'+item?.quantity+'</td><td style="text-align: left;border-bottom: 1px dashed;white-space: nowrap;">'+currency?.symbol+ ' '+ (item.total * item?.quantity).toFixed(2)+'</td></tr>'

            ))}
       
    </tbody>
</table>
<br>
<table style="font-size: 8px"> <tr>
    <td style="width: 200px;">Total</td>
    <td style="width: 100%;padding: 8px;"></td>
    <td style="white-space: nowrap;">${currency?.symbol} ${subTotal || 0}</td>
</tr>  </table>
<table style="font-size: 8px">  <tr>
    <td>VAT (${vat}%)</td>
    <td style="width: 100%;padding: 8px;"></td>
    <td style=" white-space: nowrap;">${currency?.symbol} ${vatAmount || 0}</td>
</tr>  </table>
<table style="font-size: 8px">  <tr>
    <td style="border-bottom: 1px dashed black;">Discount</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; border-bottom: 1px dashed black;"></td>
    <td style="border-bottom: 1px dashed black;  white-space: nowrap;">${currency?.symbol} ${discount || 0}</td>
</tr>  </table>
<table style="font-size: 8px">  <tr>
    <td style="border-bottom: 1px dashed black; white-space: nowrap;">Flat Discount</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; border-bottom: 1px dashed black;"></td>
    <td style="border-bottom: 1px dashed black;  white-space: nowrap;">${currency?.symbol} ${flatDiscount || 0}</td>
</tr>  </table>
<table>  <tr><td style="padding: 8px;"></td></tr> </table>
<table style="font-size: 8px">  <tr>
    <td  style="width: 200px; white-space: nowrap;">Net Amount</td>
    <td style="width: 100%;padding: 8px;"></td>
    <td><span style="border: 1px solid black; border-radius: 4px; padding: 6px; white-space: nowrap;">${currency?.symbol} ${netAmount || 0}</span></td>
</tr>  </table>
<table style="font-size: 8px">  <tr><td style="padding: 8px;"></td></tr>  </table>
<table style="font-size: 8px">  <tr>
    <td style="white-space: nowrap;">Paid By</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; "></td>
    <td style="">${payMethod}</td>
</tr></table>
<table style="font-size: 8px"> <tr>
    <td style="white-space: nowrap;">Paid By Card</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; "></td>
    <td style="white-space: nowrap;">${currency?.symbol} ${payMethod === 'card' ? netAmount || 0 : 0}</td>
</tr></table>
<table style="font-size: 8px"> <tr>
    <td style="white-space: nowrap;">Paid By Cash</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; "></td>
    <td style="white-space: nowrap;">${currency?.symbol} ${payMethod === 'cash' ? netAmount || 0 : 0}</td>
</tr></table>
<table style="width: 100%;"><tr><td style="padding: 8px; border-bottom: 1px dashed black;"></td> <td style="border-bottom: 1px dashed black"></td><td style="border-bottom: 1px dashed black"></td></tr></table>
<table>
    
   
   
    
   
   

  
   
   
    

</table>

<div style=" font-size: 12px; text-align: center;">
    <p style="font-weight: 600; margin-top: 20px; ">Thank you for the business!</p>
    
        <p style="font-weight: normal;line-height: 0px; font-size: 14px; margin-top: 10px; margin-bottom: 10px;">Return policy need this invoice must</p>

</div>



    </main>
    
</body>
</html>
`;
export const billTemplateThermal= ({currency, payMethod, customerName, customerPhone, products, subTotal, vat, vatAmount, discount, netAmount, storeName, storeAddress, storePhone, invoiceId, cashier, flatDiscount, date})=> ` 
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style> p {margin: 0px;} </style>
</head>
<body>
    <main style="width:320px; margin: 5px;">
        <div style="display: flex; align-items: center; justify-content: center; padding-top: 30px;">
            <img src="data:image/svg+xml,%3Csvg%20width%3D%2264%22%20height%3D%2264%22%20viewBox%3D%220%200%20120%20120%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M16%2030H32L42%2078H88L98%2044H36%22%20fill%3D%22none%22%20stroke%3D%22%23023535%22%20stroke-width%3D%227%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Cpath%20d%3D%22M52%2058L62%2068L80%2050%22%20fill%3D%22none%22%20stroke%3D%22%230CABA8%22%20stroke-width%3D%226%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3Ccircle%20cx%3D%2250%22%20cy%3D%2294%22%20r%3D%228%22%20fill%3D%22%23023535%22/%3E%3Ccircle%20cx%3D%2284%22%20cy%3D%2294%22%20r%3D%228%22%20fill%3D%22%23FFC96B%22/%3E%3C/svg%3E" width="64" height="64" alt="CartPOS">

        </div>
<div style="text-align: center;">
    <p style="color: #015958; font-size: 14px; font-weight: 400; margin-top: 20px;">${storeName || 'Store Name'}</p>
    <p style= "font-size: 12px;"> ${storeAddress || 'Store Address'}</p>
    <p style="font-size: 12px;">Phone: ${storePhone || 'Store phone'}</p></div>

    <p style=" font-size: 16px; font-weight: 600; text-align: center; margin-top: 20px; margin-bottom:20px;">Sales Receipt</p>
<div style="font-size: 10px;  font-weight: 600; display: flex; justify-content: space-between;">
    <div style="flex: 1;">
        <p style="margin: 0;">Date: ${formatDate(date)}</p>
        <p style="margin: 0;">ID: ${invoiceId}</p>
    </div>
    <div style="text-align: right; flex: 1;">
        <p style="margin: 0;">Time: ${formatTimeWithAMPM(date)}</p>
        <p style="margin: 0;">Cashier: ${cashier}</p>
    </div>
</div>
<div style="font-size: 10px;  font-weight: 600; padding-top: 20px;">
    <p style="margin: 0;">Customer Name: ${customerName || ''}</p>
    <p style="margin: 0;">Customer Phone: ${customerPhone || ''}</p>
</div>
<p></p>

<table style=" border-collapse: collapse; width: 100%; font-size: 8px">
    <thead>
        <tr>
            <th style="border-left: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: left; padding: 8px;">SL No.</th>
            <th style="border-top: 1px solid #000; border-bottom: 1px solid #000;   padding: 8px;text-align: left;">Item / Code</th>
            <th style="border-top: 1px solid #000; border-bottom: 1px solid #000;  padding: 8px; text-align: left;">Price</th>
            <th style="border-top: 1px solid #000; border-bottom: 1px solid #000;  padding: 8px;text-align: left;">Qty</th>
            <th style="border-right: 1px solid #000; border-top: 1px solid #000; border-bottom: 1px solid #000; text-align: left; padding: 8px;">Total</th>
        </tr>
    </thead>
    <tbody >
        ${products.map((item, index)=>('<tr> <td style="text-align: left; border-bottom: 1px dashed;padding: 8px">'+(index+1) + '</td><td style="text-align: left;border-bottom: 1px dashed;">'+item?.title?.slice(0, 40)+'</td><td style="text-align: left;border-bottom: 1px dashed;">'+ currency?.symbol + ' '+ item?.price+ '</td><td style="text-align: left;border-bottom: 1px dashed;">'+item?.quantity+'</td><td style="text-align: left;border-bottom: 1px dashed;white-space: nowrap;">'+currency?.symbol+ ' '+ (item.total * item?.quantity).toFixed(2)+'</td></tr>'

            ))}
       
    </tbody>
</table>
<br>
<table style="font-size: 8px"> <tr>
    <td style="width: 200px;">Total</td>
    <td style="width: 100%;padding: 8px;"></td>
    <td style="white-space: nowrap;">${currency?.symbol} ${subTotal || 0}</td>
</tr>  </table>
<table style="font-size: 8px">  <tr>
    <td>VAT (${vat}%)</td>
    <td style="width: 100%;padding: 8px;"></td>
    <td style=" white-space: nowrap;">${currency?.symbol} ${vatAmount || 0}</td>
</tr>  </table>
<table style="font-size: 8px">  <tr>
    <td style="border-bottom: 1px dashed black;">Discount</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; border-bottom: 1px dashed black;"></td>
    <td style="border-bottom: 1px dashed black;  white-space: nowrap;">${currency?.symbol} ${discount || 0}</td>
</tr>  </table>
<table style="font-size: 8px">  <tr>
    <td style="border-bottom: 1px dashed black; white-space: nowrap;">Flat Discount</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; border-bottom: 1px dashed black;"></td>
    <td style="border-bottom: 1px dashed black;  white-space: nowrap;">${currency?.symbol} ${flatDiscount || 0}</td>
</tr>  </table>
<table>  <tr><td style="padding: 8px;"></td></tr> </table>
<table style="font-size: 8px">  <tr>
    <td  style="width: 200px; white-space: nowrap;">Net Amount</td>
    <td style="width: 100%;padding: 8px;"></td>
    <td><span style="border: 1px solid black; border-radius: 4px; padding: 6px; white-space: nowrap;">${currency?.symbol} ${netAmount || 0}</span></td>
</tr>  </table>
<table style="font-size: 8px">  <tr><td style="padding: 8px;"></td></tr>  </table>
<table style="font-size: 8px">  <tr>
    <td style="white-space: nowrap;">Paid By</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; "></td>
    <td style="">${payMethod}</td>
</tr></table>
<table style="font-size: 8px"> <tr>
    <td style="white-space: nowrap;">Paid By Card</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; "></td>
    <td style="white-space: nowrap;">${currency?.symbol} ${payMethod === 'card' ? netAmount || 0 : 0}</td>
</tr></table>
<table style="font-size: 8px"> <tr>
    <td style="white-space: nowrap;">Paid By Cash</td>
    <td style="width: 100%;padding: 8px; padding-bottom: 16px; "></td>
    <td style="white-space: nowrap;">${currency?.symbol} ${payMethod === 'cash' ? netAmount || 0 : 0}</td>
</tr></table>
<table style="width: 100%;"><tr><td style="padding: 8px; border-bottom: 1px dashed black;"></td> <td style="border-bottom: 1px dashed black"></td><td style="border-bottom: 1px dashed black"></td></tr></table>
<table>
    
   
   
    
   
   

  
   
   
    

</table>

<div style=" font-size: 12px; text-align: center;">
    <p style="font-weight: 600; margin-top: 20px; ">Thank you for the business!</p>
    
        <p style="font-weight: normal;line-height: 0px; font-size: 14px; margin-top: 10px; margin-bottom: 10px;">Return policy need this invoice must</p>

</div>



    </main>
    
</body>
</html>`;