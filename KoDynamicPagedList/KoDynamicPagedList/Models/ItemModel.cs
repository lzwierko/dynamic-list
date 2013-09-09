using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace KoDynamicPagedList.Models
{
    public class ItemModel
    {
        public ItemModel()
        {
        }

        public ItemModel(int id)
        {
            Id = id;
            Name = Guid.NewGuid().ToString();
            Text = Guid.NewGuid().ToString();
        }

        public int Id { get; set; }
        public string Name { get; set; }
        public string Text { get; set; }
    }
}