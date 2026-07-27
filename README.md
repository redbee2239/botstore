# BotStore

Discord bot cho quy trinh ban hang, quan ly don va ticket ho tro.

## Chuc nang da hoan thanh

- `/setup`: Tao Home Panel voi cac nut Mua hang, Ho tro va Theo doi don hang.
- `/category add|remove|list`: Quan ly danh muc san pham cho Admin.
- `/product add|remove|list`: Quan ly san pham, gia, emoji va danh muc cho Admin.
- `/ping` va `!ping`: Kiem tra do tre bot.
- Mua hang: Khach chon danh muc, san pham, so luong va ghi chu; bot tinh tong tien, tao ma don, dua don vao queue va tao ticket rieng.
- Theo doi don hang: Hien thi don cua nguoi dung, trang thai, vi tri queue va link ticket.
- Ticket ho tro: Tao ticket rieng, khong cho mot nguoi dung tao nhieu ticket ho tro dang mo.
- Bang ticket tuy chinh: Admin dat noi dung, them/xoa toi da 25 nut va gui bang ticket bang lenh `/ticket`.
- Nhan don: Staff nhan don dang cho, chuyen trang thai sang `Processing` va gan nhan vien phu trach.
- Huy don: Khach chi huy duoc don dang cho; Staff co the huy don dang xu ly.
- Phan quyen ticket: Khach va cac role Staff cau hinh co quyen truy cap ticket.
- Dong ticket: Xuat toan bo noi dung chat thanh file `.txt`, luu duong dan transcript, gui file vao channel log va xoa channel ticket.
- Luu du lieu: Don hang, ticket, san pham, danh muc va queue duoc luu bang file JSON.

## Transcript ticket

Khi dong ticket, bot tao file trong `transcripts/` va gui file vao channel co ID trong `TICKET_LOG_CHANNEL_ID`. Neu bien nay khong co, bot dung `LOG_CHANNEL_ID` neu da cau hinh.

Bot can quyen `View Channel`, `Send Messages`, `Attach Files` va `Manage Channels` de gui transcript va xoa ticket.

## Bang ticket tuy chinh

- `/ticket nd noi_dung:<noi dung>`: Dat noi dung bang ticket.
- `/ticket btn noi_dung:<noi dung nut>`: Them nut tao ticket.
- `/ticket xoa-btn noi_dung:<noi dung nut>`: Xoa nut theo dung noi dung da tao.
- `/ticket gui`: Gui bang ticket vao channel hien tai.

## Chay bot

1. Sao chep `.env.example` thanh `.env` va dien token Discord.
2. Cau hinh `TICKET_LOG_CHANNEL_ID` de nhan file transcript.
3. Chay cac lenh sau:

```bash
npm install
npm start
```

Chay moi truong phat trien:

```bash
npm run dev
```

Chay bang Docker:

```bash
docker compose up -d --build
```
