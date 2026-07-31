# Báo cáo đối chiếu trang Quản lý danh mục: HTML cũ và React

Ngày đối chiếu: 01/08/2026

## 1. Nguồn đã đọc

- HTML cũ:
  - `fe-admin/assets/js/pages/categories.js`
  - `fe-admin/assets/js/api/categories-api.js`
  - `fe-admin/pages/categories.html`
- React:
  - `src/features/admin/categories/CategoriesPage.tsx`
  - `src/features/admin/categories/components/CategoryRow.tsx`
  - `src/features/admin/categories/categories.utils.ts`
  - `src/features/admin/categories/categories.service.ts`
- Ảnh lỗi hiện tại: URL đang thành `?type=child&parent_id=7` sau khi chọn “Kinh doanh số”.

## 2. Kết luận nhanh

Có hai lỗi độc lập:

1. React đang tự ghép bộ lọc `type=child` khi người dùng chỉ chọn `parent_id=7`. Đây không phải hành vi của HTML cũ. HTML cũ thay đổi select nào thì chỉ cập nhật đúng state của select đó.
2. React đang cố tình cấm kéo danh mục gốc. HTML cũ cho kéo cả root và child, nhưng giới hạn theo nhóm sibling.

## 3. Bảng đối chiếu bộ lọc

| Nội dung | HTML cũ | React hiện tại / hành vi trên ảnh | Kết luận sửa |
| --- | --- | --- | --- |
| Nguồn state | `pageState` gồm `search`, `status`, `type`, `parent_id`, `sort_by`, `page`, `per_page` | Đọc từ `searchParams` | Có thể giữ URL làm nguồn state trong React |
| Khi đổi Trạng thái | Chỉ gán `pageState.status` | Có luồng cập nhật URL chung | Chỉ đổi `status`, không sửa `type` hay `parent_id` |
| Khi đổi Loại danh mục | Chỉ gán `pageState.type` | Logic mới có thể dọn hoặc ghép filter khác | Chỉ đổi `type`; không tự thêm/xóa chỉ tiêu khác nếu người dùng chưa yêu cầu |
| Khi chọn Danh mục cha | Chỉ gán `pageState.parent_id` | URL trên ảnh tự thành `type=child&parent_id=7` | Bỏ hoàn toàn việc tự gán `type=child` |
| Ý nghĩa `parent_id=7` | Lọc các bản ghi có `parent_id = 7` | Cũng phải giữ đúng ý nghĩa này | Kết quả là con trực tiếp của “Kinh doanh số”, nhưng chip/URL không được giả vờ người dùng đã chọn thêm Loại = con |
| Chip lọc | Mỗi key có chip riêng | Ảnh hiện hai chip dù người dùng chỉ chọn một chỉ tiêu | Chỉ hiển thị chip cho giá trị người dùng thực sự chọn |
| Reset | Xóa độc lập mọi filter, sort về `newest`, page 1, per_page 20 | React dùng URL reset | Giữ reset, đồng bộ cả input, URL, chip và bảng |
| Request | Gửi `pageState` | React đang tải nguồn chủ yếu theo status rồi lọc client | Phải thống nhất một nguồn dữ liệu và không để filter này âm thầm sửa filter khác |

### Quy tắc filter phải triển khai

- Mọi control chỉ cập nhật key của chính nó và `page=1`.
- Chọn `parent_id=7` phải tạo URL `?parent_id=7`, không được tự thêm `type=child`.
- Chọn `type=child` riêng phải tạo URL `?type=child`.
- Nếu người dùng chủ động chọn cả hai thì URL mới được có `?type=child&parent_id=7`.
- Không tự đổi `type`, `status`, `search`, `parent_id` hoặc `sort_by` do một filter khác thay đổi.
- `parent_id` đã đủ nghĩa “các danh mục con trực tiếp thuộc cha này”; không cần thêm `type=child` để Backend/FE hiểu.
- Chip phải phản ánh đúng URL và đúng thao tác người dùng.
- Search debounce không được merge từ state cũ đã lỗi.

## 4. Bảng đối chiếu kéo thả và thay đổi vị trí

| Nội dung | HTML cũ | React hiện tại | Lỗi / yêu cầu sửa |
| --- | --- | --- | --- |
| Row có thể kéo | Mọi row chưa xóa có `draggable=true` | `isDraggable = category.parent_id !== null && !isDeleted` | React loại toàn bộ root nên root không kéo được |
| Điểm bắt đầu kéo | Có thể bắt đầu từ row | Chỉ chấp nhận `.drag-handle` | Nên giữ drag handle để tránh mở drawer, nhưng phải hiển thị cho cả root và child |
| Kéo root | Root chỉ được thả lên root | `handleDragDrop` trả về nếu `draggedItem.parent_id === null` | Xóa điều kiện cấm root; dùng `parent_id=null` như một nhóm sibling hợp lệ |
| Kéo child | Chỉ thả vào child cùng `parent_id` | Có kiểm tra cùng `parent_id` | Giữ quy tắc này |
| Kéo khác nhóm | Bị từ chối | Có kiểm tra một phần | Giữ và kiểm tra cả drag-over lẫn drop |
| Khi kéo root có con | HTML di chuyển root cùng các row con trong DOM | React dựng lại cây từ state | Chỉ reorder mảng root; cây React tự render các con theo root mới, không đổi `parent_id` của con |
| Chuẩn hóa thứ tự | HTML gán lại `sort_order = 1..n` theo nhóm | React cũng chuẩn hóa sibling | Giữ nguyên |
| Lưu số hiển thị | HTML tính riêng `1`, `4.1`, `4.2` | React có `displayOrder` | Chuỗi `4.1` chỉ để hiển thị; Backend chỉ nhận số nguyên của sibling |
| Nút `−/+` | HTML cũ giảm/tăng giá trị input rồi lưu từng row; chưa thật sự đổi chỗ sibling an toàn | React đã đổi chỗ sibling | Giữ cách React đổi một vị trí trong sibling vì đúng nghiệp vụ hơn |
| Lưu kéo thả | HTML cũ gọi nhiều request `updateCategory` tuần tự sau drop | React dùng thanh `Lưu thứ tự / Hủy thay đổi` và batch service | Giữ batch toolbar; không autosave từng thao tác |
| Backend thật | HTML dùng `updateCategory` từng ID | React service đang ghi rõ endpoint batch thật chưa tích hợp | Phải đọc Backend thật; không tự bịa `PUT /categories/reorder` |
| Mock | HTML/React có mock | React mock ghi local/mock repository | Không dùng kết quả mock để kết luận API Backend đã lưu thành công |

## 5. Nguyên nhân chính xác khiến kéo thả React không hoạt động

Trong `CategoryRow.tsx`, React chỉ cho kéo danh mục con:

```ts
const isDraggable = category.parent_id !== null && !isDeleted;
```

Trong `CategoriesPage.tsx`, React lại chặn root lần thứ hai:

```ts
if (
  !draggedItem ||
  !targetItem ||
  draggedItem.parent_id !== targetItem.parent_id ||
  draggedItem.parent_id === null
) return;
```

Vì vậy danh mục gốc không thể kéo dù UI có render đúng cây. Đây là lỗi logic rõ ràng, không liên quan CSS.

## 6. Cách sửa React cần áp dụng

### 6.1. Bộ lọc

Tách handler theo đúng ý nghĩa, nhưng dùng chung hàm ghi URL:

```ts
onStatusChange(value)  => updateFilters({ status: value, page: 1 })
onTypeChange(value)    => updateFilters({ type: value, page: 1 })
onParentChange(value)  => updateFilters({ parent_id: value, page: 1 })
onSortChange(value)    => updateFilters({ sort_by: value, page: 1 })
```

`updateFilters` chỉ merge các key được truyền vào. Bỏ các rule sau nếu đang có:

```ts
if (parent_id) type = "child";
if (type === "root") parent_id = "";
```

Không tự sửa filter khác. Nếu tổ hợp người dùng chủ động chọn không có dữ liệu thì hiển thị empty state và các chip tương ứng.

### 6.2. Kéo thả

Tạo một hàm duy nhất:

```ts
reorderWithinSiblings(parentId, draggedId, targetId, position)
```

Quy tắc:

- `parentId === null` là nhóm root hợp lệ.
- Child chỉ reorder trong đúng `parentId` hiện tại.
- Không thay đổi `parent_id` trong chức năng sắp xếp vị trí.
- Tìm index trong mảng sibling, không dùng index của bảng phẳng.
- Sau thao tác, gán `sort_order` của nhóm thành `1..n`.
- Cập nhật draft, bật `isOrderChanged=true`.
- Nút `−/+` và drag-drop cùng gọi hàm này.
- Thanh `Lưu thứ tự / Hủy thay đổi` phải giữ lại.
- Chỉ gửi request khi bấm `Lưu thứ tự`.

Điều kiện kéo được:

```ts
const isReorderAllowed =
  !filters.search &&
  !filters.status &&
  !filters.type &&
  !filters.parent_id &&
  !filters.empty &&
  filters.sort_by === "sort_order_asc" &&
  !isLoading &&
  !isSavingOrder;
```

Khi được phép:

```ts
const isDraggable = isReorderAllowed && !isDeleted;
```

Không còn điều kiện `parent_id !== null`.

## 7. API lưu thứ tự

Bản React đã quét đang có:

```ts
const USE_MOCK = true;
```

và khi tắt mock, `reorderCategories` chỉ trả lỗi mô tả “endpoint mong muốn”, không gọi Backend thật. Do đó trước khi sửa service phải đọc route/controller/request Backend để xác nhận:

- Endpoint thật.
- HTTP method.
- Payload là `{ items: [...] }`, `{ categories: [...] }` hay mảng trực tiếp.
- Backend cần toàn bộ sibling hay chỉ item thay đổi.
- Validation của `sort_order` và `parent_id`.
- Có transaction và xử lý trùng `sort_order` hay không.

Nếu Backend chưa có batch reorder:

- Không giả lập thành công.
- Có thể giữ draft và báo “Backend chưa hỗ trợ lưu thứ tự”.
- Hoặc dùng endpoint update từng danh mục giống HTML cũ chỉ khi contract Backend thật xác nhận và phải xử lý rollback/partial failure rõ ràng.

## 8. Checklist bắt buộc sau sửa

1. Chọn “Kinh doanh số” ở Danh mục cha: URL chỉ có `parent_id=7`; Loại vẫn là “Tất cả loại”; chỉ có chip cha.
2. Chọn Loại = Danh mục con riêng: URL chỉ có `type=child`.
3. Chủ động chọn cả hai: URL mới có cả `type=child&parent_id=7`.
4. Xóa chip nào chỉ xóa đúng key đó.
5. Reset xóa toàn bộ filter và đưa sort về mặc định.
6. Chọn `sort_order_asc`, không bật filter: thấy drag handle ở cả root và child.
7. Kéo root qua root: đổi đúng vị trí root; toàn bộ cây con đi theo khi render.
8. Kéo child trong cùng cha: hoạt động.
9. Kéo child sang cha khác hoặc root vào child: bị từ chối.
10. Nút `−/+` đổi đúng một vị trí trong sibling và dùng cùng logic với drag.
11. Chưa bấm Lưu: reload không được hiểu là đã lưu Backend.
12. Bấm Hủy: khôi phục snapshot ban đầu.
13. Bấm Lưu: đúng một luồng lưu theo contract Backend thật; lỗi thì không báo thành công.
14. `sort_order` gửi Backend luôn là số nguyên `1..n`; `4.1` chỉ là nhãn hiển thị.
15. Không mở drawer khi thao tác drag handle, chevron hoặc `−/+`.
16. Không lỗi Console và `npm run build` thành công.

## 9. File React dự kiến cần sửa

- `src/features/admin/categories/CategoriesPage.tsx`
- `src/features/admin/categories/components/CategoryRow.tsx`
- `src/features/admin/categories/categories.utils.ts`
- `src/features/admin/categories/categories.service.ts` chỉ sau khi xác nhận contract Backend
- `src/features/admin/categories/components/CategorySelect.tsx` nếu bản hiện tại đã tách custom dropdown

Không sửa router, auth, layout chung hoặc module ngoài Categories.

## 10. Lưu ý về độ mới của nguồn

Báo cáo dựa trên bản quét repo đã có và ảnh lỗi hiện tại. Trước khi chỉnh code, cần xuất lại đúng các file Categories hiện tại nếu Antigravity đã thay đổi chúng sau bản quét; chỉ đối chiếu diff mới, không quét toàn dự án.
