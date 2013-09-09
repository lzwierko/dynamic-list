using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Web.Caching;
using System.Web.Mvc;
using KoDynamicPagedList.Models;

namespace KoDynamicPagedList.Controllers
{
    public class ItemsController : Controller
    {
        private List<ItemModel> CreateItems()
        {
            var items = new List<ItemModel>();
            for (var i = 0; i < 389; ++i)
            {
                items.Add(new ItemModel(i));
            }
            return items;
        }

        private List<ItemModel> GetItemsWithToken(ref string token)
        {
            if (token == null || HttpContext.Cache[token] == null)
            {
                if (token == null)
                {
                    token = Guid.NewGuid().ToString();
                }
                var items = CreateItems();
                HttpContext.Cache.Add(token, items, null, Cache.NoAbsoluteExpiration, TimeSpan.FromMinutes(2), CacheItemPriority.Default, null);
            }
            return (List<ItemModel>)HttpContext.Cache[token];
        }

        // GET api/values
        [HttpGet]
        public JsonResult List(int idx = -1, int count = 0, string sortBy = null, string sortOrder = null, string token = null)
        {
            var items = GetItemsWithToken(ref token);
            if (idx >= 0 && count > 0)
            {
                if (idx + count > items.Count)
                    count = items.Count - idx;
                Func<ItemModel, object> selector = null;
                switch (sortBy)
                {
                    case "Id":
                        selector = model => model.Id;
                        break;
                    case "Text":
                        selector = model => model.Text;
                        break;
                    case "Name":
                        selector = model => model.Name;
                        break;
                }
                if (selector != null)
                {
                    items = sortOrder == "asc"
                            ? items.OrderBy(selector).ToList()
                            : items.OrderByDescending(selector).ToList();
                }
                items = items.GetRange(idx, count);
                return new JsonResult { Data = new { Items = items, Token = token }, ContentEncoding = Encoding.UTF8, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
            }
            return new JsonResult { Data = new { Count = items.Count, Token = token }, ContentEncoding = Encoding.UTF8, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
        }

        // GET api/values/5
        public ItemModel Get(int id, string token = null)
        {
            return GetItemsWithToken(ref token).FirstOrDefault(i => i.Id == id);
        }

        // POST api/values
        public void Update(ItemModel itemModel)
        {
            //var item = GetItemsWithToken(ref token).First(i => i.Id == itemModel.Id);
            //item.Name = itemModel.Name;
            //item.Text = itemModel.Text;
        }

        // PUT api/values/5
        public void Put(int id, ItemModel itemModel)
        {
            //.Add(itemModel);
        }

        // DELETE api/values/5
        public void Delete(int id)
        {
            //var item = Items.First(i => i.Id == id);
            //Items.Remove(item);
        }
    }
}