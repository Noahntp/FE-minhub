# 1. Danh sách khóa học:

**Mã chức năng liên quan:**

```
INS-02: Tạo khóa học mới
INS-03: Cập nhật thông tin khóa học
INS-09: Gửi khóa học chờ duyệt
INS-10: Xem lý do bị từ chối
ADD-10: Checklist hoàn thiện khóa học
```

**Mục đích hiển thị:**

Cho giảng viên xem toàn bộ khóa học do mình sở hữu, theo dõi trạng thái từng khóa và thao tác nhanh như tạo khóa mới, chỉnh sửa, kiểm tra mức độ hoàn thiện, gửi duyệt hoặc xem lý do bị từ chối.

Màn hình này giúp giảng viên biết khóa học nào đang công khai, khóa nào đang chờ duyệt, khóa nào bị từ chối và khóa nào vẫn đang trong quá trình hoàn thiện nội dung.

**Logic nghiệp vụ:**

Danh sách chỉ lấy các khóa học thuộc giảng viên đang đăng nhập. Không lấy khóa học của giảng viên khác. Khóa học đã bị soft delete thì không đưa vào danh sách mặc định.

Khi tạo khóa học mới, giảng viên phải điền đủ các thông tin cơ bản bắt buộc thì mới được lưu. Không dùng nút “Lưu nháp” trên giao diện. Tuy nhiên, ở phía hệ thống, khóa học sau khi tạo vẫn có thể nằm ở trạng thái `draft` trong database để đúng với ERD và flow xử lý hiện tại.

Trên giao diện, không nên hiển thị chữ `draft`. Thay vào đó, hiển thị thân thiện là:

```
Đang hoàn thiện
```

Mỗi khóa học nên hiển thị trạng thái hiện tại để giảng viên biết cần làm gì tiếp theo. Trạng thái trên UI nên được hiểu như sau:

```
Đang hoàn thiện: khóa đã được tạo nhưng chưa gửi duyệt hoặc còn cần bổ sung nội dung.
Chờ duyệt: khóa đã gửi admin duyệt và đang chờ kết quả.
Bị từ chối: khóa bị admin từ chối, giảng viên cần xem lý do và chỉnh sửa lại.
Đang công khai: khóa đang được hiển thị/có thể học hoặc bán trên hệ thống.
Đã ẩn: khóa không còn hiển thị công khai.
```

Mapping với trạng thái trong database:

```
draft → Đang hoàn thiện
pending_review → Chờ duyệt
rejected → Bị từ chối
published → Đang công khai
hidden → Đã ẩn
approved → Đã duyệt
```

Chức năng checklist không tự đổi trạng thái khóa học. Checklist chỉ giúp giảng viên biết khóa còn thiếu thông tin gì trước khi gửi duyệt. Khi khóa đủ điều kiện, giảng viên mới bấm “Gửi duyệt” để hệ thống chuyển khóa sang trạng thái chờ duyệt.

**Mức độ xử lý:**

Trung bình. Cần truy vấn danh sách khóa học theo giảng viên đang đăng nhập, hỗ trợ tìm kiếm, lọc trạng thái và phân trang.

Ngoài ra, cần xử lý thêm phần hiển thị trạng thái thân thiện trên giao diện, tức là trạng thái trong database vẫn giữ nguyên nhưng label trên UI được đổi sang ngôn ngữ dễ hiểu cho giảng viên.

**Tương tác người dùng:**

```
- Bấm “+ Tạo khóa học” để tạo khóa học mới.
- Khi tạo khóa học, nếu thiếu thông tin cơ bản bắt buộc thì không cho lưu.
- Tìm kiếm khóa học theo tên.
- Lọc theo trạng thái: tất cả, đang hoàn thiện, chờ duyệt, bị từ chối, đang công khai, đã ẩn.
- Bấm vào một khóa học để vào trang chi tiết khóa học.
- Bấm “Sửa” để cập nhật thông tin khóa học.
- Bấm “Checklist” để xem khóa còn thiếu thông tin gì.
- Bấm “Gửi duyệt” nếu khóa đủ điều kiện gửi admin duyệt.
- Bấm “Xem lý do” nếu khóa bị từ chối.
```

Khi bấm vào trạng thái **Đang hoàn thiện**, hệ thống có thể đưa giảng viên đến phần checklist hoặc trang chỉnh sửa khóa học để tiếp tục bổ sung thông tin.

Khi bấm vào trạng thái **Bị từ chối**, hệ thống nên ưu tiên hiển thị lý do từ chối của admin và các nút hành động như:

```
Xem lý do
Chỉnh sửa khóa học
Xem checklist
Gửi duyệt lại
```

Khi bấm vào trạng thái **Chờ duyệt**, hệ thống chỉ nên cho xem thông tin và hạn chế chỉnh sửa nếu chính sách đã chốt là khóa đang duyệt thì không được thay đổi nội dung cho đến khi admin xử lý.
-
- # 2. Tạo khóa học (Xem tham khảo) (có chỉnh)
  
  **Mã liên quan:**
  
  ```
  INS-02: Tạo khóa học mới
  ```
  
  **Mục đích:**
  
  Cho giảng viên tạo khóa học mới.
  
  **Nên có form nhập:**
  
  ```
  - Tên khóa học
  - Slug nếu cho nhập, hoặc hệ thống tự sinh
  - Mô tả ngắn
  - Mô tả chi tiết
  - Ảnh thumbnail
  - Video giới thiệu nếu có trong DB
  - Giá
  - Giá sale
  - Danh mục
  - Level
  - Ngôn ngữ
  - Yêu cầu đầu vào
  - Kết quả đạt được sau khóa học
  ```
  
  **Logic đã chốt:**
  
  có dùng nút “Lưu nháp” trên UI. Giảng viên phải điền đủ thông tin cơ bản thì mới lưu được. Nhưng trong DB/backend vẫn có thể dùng trạng thái `draft`, chỉ hiển thị trên giao diện là **Đang hoàn thiện**.
  
  Chỉnh thêm: ghi thêm các trường thông tin phải nhập vào lúc tạo khóa( nội dung quiz nếu có), các trường tt được chia làm bao nhiêu mục để dễ kiểm soát và quan sát (giảng viên thực hiện tạo khóa học theo từng bước).
  
  <!-- notionvc: bb403606-9bc6-415d-bcb0-4c5e8e43dee1 -->
- # 3. Chi tiết khóa học (có chỉnh)
  
  Đây là màn hình sau khi bấm vào một khóa học.
  
  **Nên chia thành tab:**
  
  ```
  1. Tổng quan
  2. Nội dung khóa học
  3. Quiz / Test
  4. Checklist
  5. Học viên của khóa
  6. Doanh thu khóa này
  ```
  
  Trong đó tab chính thuộc **Quản lý khóa học** là:
  
  ```
  - Tổng quan
  - Nội dung khóa học
  - Quiz / Test
  - Checklist
  ```
  
  Còn **Học viên** và **Doanh thu** có thể đưa vào để xem nhanh theo khóa, nhưng sidebar vẫn có mục riêng nếu bạn muốn quản lý tổng.
  
  Chỉnh thêm: xóa phần tạo quiz / Test theo ý cô Hường.
  
  <!-- notionvc: 3140f369-5934-4719-a8ab-e6d8a9bb84e3 -->
-
- # 4. Cập nhật thông tin khóa học
  
  **Mã liên quan:**
  
  ```
  INS-03: Cập nhật thông tin khóa học
  ```
  
  **Mục đích:**
  
  Cho giảng viên sửa thông tin cơ bản của khóa học.
  
  **Nên cho sửa:**
  
  <!-- notionvc: 98abf38e-3289-466f-b2b3-4e10fedec638 -->
- ```
  - Tên khóa học
  - Mô tả ngắn
  - Mô tả chi tiết
  - Thumbnail
  - Video giới thiệu
  - Giá / giá sale
  - Danh mục
  - Level
  - Ngôn ngữ
  - Yêu cầu đầu vào
  - Kết quả đạt được
  ```
  
  <!-- notionvc: 324a5610-fb3a-44d2-a312-4981bdeeaf50 -->
-
- # 5. Nội dung khóa học (Xem tham khảo)
  id:: 6a4f3164-7b84-488b-9f5d-9de4687ea468
- ## 5.1. Chương học
  
  **Mục đích:**
  
  Chia khóa học thành nhiều phần/chương.
  
  **Nên có:**
  
  ```
  - Thêm chương
  - Sửa chương
  - Sắp xếp thứ tự chương
  - Ẩn/hiện chương nếu có status
  - Xóa mềm chương
  ```
  
  Ví dụ:
  
  <!-- notionvc: 1b3ba080-dda4-47f2-8026-b1c79c3e0c44 -->
- ## 5.2. Bài học
- **Mục đích:**
  
  Quản lý các bài học nằm trong chương.
  
  **Nên có:**
  
  ```
  - Thêm bài học
  - Sửa bài học
  - Chọn loại bài học: video/text
  - Nhập nội dung bài học
  - Sắp xếp thứ tự bài học
  - Cập nhật trạng thái bài học
  - Xóa mềm bài học
  ```
  
  Mỗi bài học nên hiển thị:
  
  <!-- notionvc: 75f591a6-edf6-4e0e-af7b-735a54d2974e -->
- ```
  - Tên bài học
  - Thuộc chương nào
  - Loại bài học
  - Trạng thái
  - Có video chưa
  - Có tài liệu chưa
  - Có phải bài preview không
  ```
  
  <!-- notionvc: 401084f6-76f4-4e24-aff2-00c52ed5ee8d -->
- ## 5.3. Video bài học
  
  **Mã liên quan:**
  
  ```
  INS-06: Upload video bài học
  ```
  
  **Mục đích:**
  
  Upload hoặc thay video cho bài học dạng video.
  
  **Nên có:**
  
  ```
  - Upload video
  - Xem video đã upload
  - Thay video
  - Hiển thị thời lượng video nếu có
  - Báo lỗi nếu bài học video chưa có video
  ```
  
  <!-- notionvc: ca678ccc-2a5c-4c45-bc8d-5b9717878ec6 -->
- ## 5.4. Tài liệu bài học
  
  **Mã liên quan:**
  
  ```
  INS-07: Upload tài liệu bài học
  ```
  
  **Mục đích:**
  
  Cho giảng viên đính kèm tài liệu cho bài học.
  
  **Nên có:**
  
  ```
  - Upload tài liệu
  - Xem danh sách tài liệu
  - Xóa tài liệu nếu được phép
  - Hiển thị tên file, loại file, dung lượng nếu DB có
  ```
  
  <!-- notionvc: 89f4f470-84ff-4f8c-aa90-e08a09fcbac2 -->
- ## 5.5. Bài preview miễn phí
  
  **Mã liên quan:**
  
  ```
  INS-08: Chọn bài preview miễn phí
  ```
  
  **Mục đích:**
  
  Cho giảng viên chọn bài học để học viên xem thử trước khi mua khóa.
  
  **Nên có:**
  
  ```
  - Bật/tắt preview cho từng bài học
  - Hiển thị nhãn Preview
  - Lọc bài học đang preview
  ```
  
  <!-- notionvc: b2637576-64f8-49c7-aad0-d6232679921b -->
-
-
-